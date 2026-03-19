import type { NextApiRequest, NextApiResponse } from 'next';
import { bookingApi } from '../../services/bookingApi';
import { BookingStatus } from '../../types';

/**
 * 预约数据 API 路由
 * 处理预约相关的API请求，作为前后端之间的代理层
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 根据请求方法处理不同的操作
    switch (req.method) {
      case 'GET':
        await handleGetRequest(req, res);
        break;
      case 'POST':
        await handlePostRequest(req, res);
        break;
      case 'PATCH':
        await handlePatchRequest(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API路由错误:', error);
    res.status(500).json({
      error: '服务器错误',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
}

/**
 * 处理GET请求
 * 获取预约列表或可用时间段
 */
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { date, all, id } = req.query;

  // 获取单个预约详情
  if (id) {
    const booking = await bookingApi.getBookingById(id as string);
    return res.status(200).json(booking);
  }

  // 获取所有预约（管理员权限）
  if (all === 'true') {
    const bookings = await bookingApi.getBookings();
    return res.status(200).json(bookings);
  }

  // 获取指定日期的可用时间段
  if (date) {
    const slots = await bookingApi.getAvailableSlots(date as string);
    return res.status(200).json(slots);
  }

  // 默认获取当前用户的预约
  const bookings = await bookingApi.getMyBookings();
  res.status(200).json(bookings);
}

/**
 * 处理POST请求
 * 创建新的预约
 */
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  const bookingData = req.body;

  // 验证必要的预约数据
  if (!bookingData || !bookingData.date || !bookingData.startTime || !bookingData.endTime) {
    return res.status(400).json({ error: '缺少必要的预约数据' });
  }

  const newBooking = await bookingApi.createBooking(bookingData);
  res.status(201).json(newBooking);
}

/**
 * 处理PATCH请求
 * 更新预约状态（如取消预约）
 */
async function handlePatchRequest(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { action } = req.body;

  if (!id) {
    return res.status(400).json({ error: '缺少预约ID' });
  }

  if (action === 'cancel') {
    const result = await bookingApi.cancelBooking(id as string);
    return res.status(200).json(result);
  }

  // 未来可以扩展更多操作，如确认预约等
  res.status(400).json({ error: '不支持的操作' });
}

/**
 * 验证请求中的用户身份
 * 在实际应用中，这里应该有更复杂的身份验证逻辑
 */
function authenticateRequest(req: NextApiRequest): boolean {
  // 简化的身份验证示例
  // 实际应用中应该使用JWT或session进行验证
  const authHeader = req.headers.authorization;
  return !!authHeader;
}
