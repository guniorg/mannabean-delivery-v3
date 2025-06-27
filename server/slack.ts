import { WebClient } from "@slack/web-api";
import type { Order, OrderItem, MenuItem } from "@shared/schema";
import { formatPrice } from "../client/src/lib/utils";

// Check for required environment variables
if (!process.env.SLACK_BOT_TOKEN) {
  console.warn("SLACK_BOT_TOKEN environment variable not set");
}

if (!process.env.SLACK_CHANNEL_ID) {
  console.warn("SLACK_CHANNEL_ID environment variable not set");
}

const slack = process.env.SLACK_BOT_TOKEN ? new WebClient(process.env.SLACK_BOT_TOKEN) : null;

interface OrderWithItems extends Order {
  items: (OrderItem & { menuItem: MenuItem })[];
}

/**
 * Send order notification to Slack channel
 */
export async function sendOrderNotification(order: OrderWithItems): Promise<boolean> {
  if (!slack || !process.env.SLACK_CHANNEL_ID) {
    console.log("Slack not configured - order notification skipped");
    return false;
  }

  try {
    const orderTypeText = order.orderType === 'delivery' ? '🛵 배달' : '🏪 테이블예약';
    const statusEmoji = order.status === 'pending' ? '🔔' : '✅';
    
    // Calculate totals
    const subtotal = order.items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const deliveryFee = order.orderType === 'delivery' ? (order.deliveryLocation ? getDeliveryFee(order.deliveryLocation) : 0) : 0;
    const tax = Math.round((subtotal + deliveryFee) * 0.08);
    const total = subtotal + deliveryFee + tax;

    // Build order items text
    const itemsText = order.items.map(item => 
      `• ${item.menuItem.name} x${item.quantity} - ${formatPrice(item.menuItem.price * item.quantity)}`
    ).join('\n');

    const locationText = order.orderType === 'delivery' 
      ? `📍 ${getLocationDisplayName(order.deliveryLocation || '')}${order.detailAddress ? '\n   ' + order.detailAddress : ''}`
      : '🏪 매장 테이블 예약';

    const message = {
      channel: process.env.SLACK_CHANNEL_ID,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${statusEmoji} 새 주문 접수 - ${order.orderNumber}`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*주문 방식:*\n${orderTypeText}`
            },
            {
              type: "mrkdwn",
              text: `*연락처:*\n${order.customerPhone}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*배달 정보:*\n${locationText}`
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*주문 내역:*\n${itemsText}`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*소계:* ${formatPrice(subtotal)}`
            },
            {
              type: "mrkdwn",
              text: `*배달비:* ${formatPrice(deliveryFee)}`
            },
            {
              type: "mrkdwn",
              text: `*부가세:* ${formatPrice(tax)}`
            },
            {
              type: "mrkdwn",
              text: `*총액:* ${formatPrice(total)}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*결제 방식:* ${getPaymentMethodDisplayName(order.paymentMethod)}`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `주문 시간: ${new Date(order.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Ho_Chi_Minh' })}`
            }
          ]
        }
      ]
    };

    await slack.chat.postMessage(message);
    console.log(`Order notification sent to Slack: ${order.orderNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}

/**
 * Send order status update to Slack
 */
export async function sendOrderStatusUpdate(order: Order, newStatus: string): Promise<boolean> {
  if (!slack || !process.env.SLACK_CHANNEL_ID) {
    return false;
  }

  try {
    const statusEmojis = {
      'pending': '🔔 접수됨',
      'confirmed': '✅ 확인됨',
      'preparing': '👨‍🍳 준비중',
      'ready': '🍽️ 준비완료',
      'delivered': '🛵 배달완료',
      'completed': '✅ 완료',
      'cancelled': '❌ 취소됨'
    };

    const message = {
      channel: process.env.SLACK_CHANNEL_ID,
      text: `주문 ${order.orderNumber} 상태 업데이트: ${statusEmojis[newStatus as keyof typeof statusEmojis] || newStatus}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🔄 *주문 상태 업데이트*\n주문번호: ${order.orderNumber}\n상태: ${statusEmojis[newStatus as keyof typeof statusEmojis] || newStatus}`
          }
        }
      ]
    };

    await slack.chat.postMessage(message);
    return true;
  } catch (error) {
    console.error('Error sending status update to Slack:', error);
    return false;
  }
}

// Helper functions
function getDeliveryFee(location: string): number {
  switch (location) {
    case 'kalidas':
    case 'kyeongnamA':
    case 'kyeongnamB':
      return 0;
    case 'other':
      return 30000;
    default:
      return 0;
  }
}

function getLocationDisplayName(location: string): string {
  switch (location) {
    case 'kalidas':
      return '칼리다스';
    case 'kyeongnamA':
      return '경남A';
    case 'kyeongnamB':
      return '경남B';
    case 'other':
      return '기타 주소';
    default:
      return location;
  }
}

function getPaymentMethodDisplayName(paymentMethod: string): string {
  switch (paymentMethod) {
    case 'cash':
      return '현금 결제 (COD)';
    case 'transfer':
      return '계좌 이체';
    default:
      return paymentMethod;
  }
}