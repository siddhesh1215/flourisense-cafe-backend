const { Order, Review, User, MenuItem } = require('../../models');
const { success, serverError } = require('../../utils/response.helper');
const { Op } = require('sequelize');

// ─── GET /admin/analytics/dashboard ────────────────────────────────────────────
/**
 * Get dashboard summary with key metrics
 */
module.exports.getDashboard = async (req, res) => {
  try {
    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's orders count
    const todaysOrders = await Order.count({
      where: {
        created_on: { [Op.gte]: today, [Op.lt]: tomorrow },
      },
    });

    // Today's revenue
    const todaysRevenue = await Order.sum('total_amount', {
      where: {
        created_on: { [Op.gte]: today, [Op.lt]: tomorrow },
        status_id: 6, // completed orders only
      },
    });

    // Active orders (pending, processing, ready)
    const activeOrders = await Order.count({
      where: { status_id: { [Op.in]: [4, 5, 8] } },
    });

    // Average rating
    const avgRating = await Review.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'average'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalReviews'],
      ],
      where: { is_approved: true, inactive: false },
      raw: true,
    });

    return success(res, 'Dashboard metrics fetched successfully', {
      todays_orders: todaysOrders,
      revenue_today: todaysRevenue || 0,
      active_orders: activeOrders,
      avg_rating: avgRating?.average ? parseFloat(avgRating.average).toFixed(2) : 0,
      total_reviews: avgRating?.totalReviews || 0,
    });
  } catch (error) {
    console.error('[ADMIN ANALYTICS DASHBOARD ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/analytics/revenue ──────────────────────────────────────────────
/**
 * Get revenue analytics (daily, weekly, monthly)
 */
module.exports.getRevenue = async (req, res) => {
  try {
    const { range = 'daily' } = req.query; // daily, weekly, monthly

    const today = new Date();
    let startDate = new Date();
    let groupFormat;

    if (range === 'daily') {
      // Last 7 days
      startDate.setDate(today.getDate() - 7);
      groupFormat = '%Y-%m-%d';
    } else if (range === 'weekly') {
      // Last 4 weeks
      startDate.setDate(today.getDate() - 28);
      groupFormat = '%Y-W%u';
    } else if (range === 'monthly') {
      // Last 12 months
      startDate.setMonth(today.getMonth() - 12);
      groupFormat = '%Y-%m';
    }

    const revenueData = await Order.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('created_on')), 'date'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'revenue'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'orders'],
      ],
      where: {
        created_on: { [Op.gte]: startDate },
        status_id: 4, // completed orders only
      },
      group: [require('sequelize').fn('DATE', require('sequelize').col('created_on'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('created_on')), 'ASC']],
      raw: true,
      subQuery: false,
    });

    const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalOrders = revenueData.reduce((sum, item) => sum + (item.orders || 0), 0);

    return success(res, 'Revenue analytics fetched successfully', {
      range,
      period: {
        startDate,
        endDate: today,
      },
      summary: {
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        totalOrders,
        averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
      },
      data: revenueData,
    });
  } catch (error) {
    console.error('[ADMIN ANALYTICS REVENUE ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/analytics/orders ───────────────────────────────────────────────
/**
 * Get order analytics (count by status, daily trends)
 */
module.exports.getOrders = async (req, res) => {
  try {
    // Orders by status
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status_id'],
      include: [
        {
          model: require('../../models').Reference,
          as: 'status',
          attributes: ['name', 'code'],
          required: false,
        },
      ],
      raw: true,
      subQuery: false,
    });

    // Orders today vs yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todaysOrderCount = await Order.count({
      where: {
        created_on: { [Op.gte]: today, [Op.lt]: tomorrow },
      },
    });

    const yesterdaysOrderCount = await Order.count({
      where: {
        created_on: { [Op.gte]: yesterday, [Op.lt]: today },
      },
    });

    const percentChange =
      yesterdaysOrderCount === 0
        ? 0
        : (((todaysOrderCount - yesterdaysOrderCount) / yesterdaysOrderCount) * 100).toFixed(2);

    return success(res, 'Order analytics fetched successfully', {
      byStatus: ordersByStatus,
      dailyComparison: {
        today: todaysOrderCount,
        yesterday: yesterdaysOrderCount,
        percentChange: parseFloat(percentChange),
        trend: todaysOrderCount >= yesterdaysOrderCount ? 'up' : 'down',
      },
    });
  } catch (error) {
    console.error('[ADMIN ANALYTICS ORDERS ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/analytics/ratings ──────────────────────────────────────────────
/**
 * Get rating analytics
 */
module.exports.getRatings = async (req, res) => {
  try {
    // Average rating
    const avgRating = await Review.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'average'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
      ],
      where: { is_approved: true, inactive: false },
      raw: true,
    });

    // Rating distribution
    const ratingDistribution = await Review.findAll({
      attributes: [
        'rating',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      where: { is_approved: true, inactive: false },
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true,
      subQuery: false,
    });

    // Top rated menu items
    const topRatedItems = await MenuItem.findAll({
      attributes: [
        'id',
        'name',
        [require('sequelize').fn('AVG', require('sequelize').col('Reviews.rating')), 'averageRating'],
        [require('sequelize').fn('COUNT', require('sequelize').col('Reviews.id')), 'reviewCount'],
      ],
      include: [
        {
          model: Review,
          attributes: [],
          where: { is_approved: true, inactive: false },
          required: false,
        },
      ],
      group: ['MenuItem.id'],
      order: [
        [require('sequelize').fn('AVG', require('sequelize').col('Reviews.rating')), 'DESC'],
      ],
      limit: 5,
      subQuery: false,
      raw: true,
    });

    return success(res, 'Rating analytics fetched successfully', {
      averageRating: avgRating?.average ? parseFloat(avgRating.average).toFixed(2) : 0,
      totalReviews: avgRating?.total || 0,
      distribution: ratingDistribution,
      topRatedItems: topRatedItems.map((item) => ({
        ...item,
        averageRating: item.averageRating ? parseFloat(item.averageRating).toFixed(2) : 0,
      })),
    });
  } catch (error) {
    console.error('[ADMIN ANALYTICS RATINGS ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/analytics/summary ──────────────────────────────────────────────
/**
 * Get complete analytics summary
 */
module.exports.getSummary = async (req, res) => {
  try {
    // Get all analytics in one call
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for performance
    const [
      todaysOrders,
      todaysRevenue,
      activeOrders,
      avgRating,
      totalCustomers,
      totalMenuItems,
    ] = await Promise.all([
      Order.count({
        where: { created_on: { [Op.gte]: today, [Op.lt]: tomorrow } },
      }),
      Order.sum('total_amount', {
        where: {
          created_on: { [Op.gte]: today, [Op.lt]: tomorrow },
          status_id: 4,
        },
      }),
      Order.count({ where: { status_id: { [Op.in]: [1, 2, 3] } } }),
      Review.findOne({
        attributes: [
          [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'average'],
        ],
        where: { is_approved: true, inactive: false },
        raw: true,
      }),
      User.count(),
      MenuItem.count({ where: { inactive: false } }),
    ]);

    return success(res, 'Analytics summary fetched successfully', {
      todaysMetrics: {
        ordersCount: todaysOrders,
        revenue: todaysRevenue || 0,
      },
      activeMetrics: {
        activeOrders,
        averageRating: avgRating?.average ? parseFloat(avgRating.average).toFixed(2) : 0,
      },
      systemMetrics: {
        totalCustomers,
        totalMenuItems,
      },
    });
  } catch (error) {
    console.error('[ADMIN ANALYTICS SUMMARY ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/analytics/popular-items ───────────────────────────────────────
/**
 * Get popular menu items (most ordered)
 */
module.exports.getPopularItems = async (req, res) => {
  try {
    const { limit = 10, days = 30 } = req.query;

    // Calculate date range (last N days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get most ordered items
    const { CartItem } = require('../../models');
    const sequelize = require('../../config/dbConfig');

    const popularItems = await MenuItem.findAll({
      attributes: [
        'id',
        'name',
        'emoji',
        'price',
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('CartItems.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('CartItems.quantity')), 'totalQuantity'],
        [
          sequelize.fn('SUM', sequelize.literal('CartItems.quantity * CartItems.price')),
          'totalRevenue',
        ],
      ],
      include: [
        {
          model: CartItem,
          attributes: [],
          required: false,
          through: { attributes: [] },
        },
        {
          model: require('../../models').MenuCategory,
          attributes: ['id', 'name'],
        },
      ],
      where: { inactive: false },
      group: ['MenuItem.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('CartItems.id')), 'DESC']],
      limit: parseInt(limit),
      subQuery: false,
      raw: true,
    });

    // Also get by orders in last N days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - parseInt(days));
    rangeStart.setHours(0, 0, 0, 0);

    const itemsInRange = await Order.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
      ],
      where: {
        created_on: { [Op.gte]: rangeStart, [Op.lte]: today },
      },
      subQuery: false,
      raw: true,
    });

    return success(res, 'Popular items fetched successfully', {
      period: {
        days: parseInt(days),
        startDate: rangeStart,
        endDate: today,
      },
      items: popularItems.map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        price: item.price,
        orderCount: parseInt(item.orderCount) || 0,
        totalQuantity: parseInt(item.totalQuantity) || 0,
        totalRevenue: item.totalRevenue ? parseFloat(item.totalRevenue).toFixed(2) : 0,
        category: item['MenuCategory.name'] || 'Uncategorized',
      })),
      totalOrders: itemsInRange[0]?.orderCount || 0,
    });
  } catch (error) {
    console.error('[ADMIN ANALYTICS POPULAR ITEMS ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/analytics/peak-hours ───────────────────────────────────────────
/**
 * Get peak ordering hours
 */
module.exports.getPeakHours = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const sequelize = require('../../config/dbConfig');

    // Calculate date range
    const rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - parseInt(days));
    rangeStart.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Get orders by hour
    const peakHours = await Order.findAll({
      attributes: [
        [
          sequelize.fn('STRFTIME', '%H', sequelize.col('created_on')),
          'hour',
        ],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [
          sequelize.fn('SUM', sequelize.col('total_amount')),
          'revenue',
        ],
      ],
      where: {
        created_on: { [Op.gte]: rangeStart, [Op.lte]: today },
      },
      group: [sequelize.fn('STRFTIME', '%H', sequelize.col('created_on'))],
      order: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'DESC'],
      ],
      subQuery: false,
      raw: true,
    });

    // Format hour data (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: String(i).padStart(2, '0'),
      orderCount: 0,
      revenue: 0,
    }));

    peakHours.forEach((ph) => {
      const hourIndex = parseInt(ph.hour);
      if (hourIndex >= 0 && hourIndex < 24) {
        hours[hourIndex] = {
          hour: String(hourIndex).padStart(2, '0'),
          orderCount: parseInt(ph.orderCount) || 0,
          revenue: ph.revenue ? parseFloat(ph.revenue).toFixed(2) : 0,
        };
      }
    });

    // Find peak hours
    const peakHoursList = hours
      .filter((h) => h.orderCount > 0)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    // Get average orders per hour
    const avgOrdersPerHour =
      hours.reduce((sum, h) => sum + h.orderCount, 0) / hours.filter((h) => h.orderCount > 0).length || 0;

    return success(res, 'Peak hours analytics fetched successfully', {
      period: {
        days: parseInt(days),
        startDate: rangeStart,
        endDate: today,
      },
      allHours: hours,
      peakHours: peakHoursList.map((ph) => ({
        hour: `${ph.hour}:00`,
        orderCount: ph.orderCount,
        revenue: ph.revenue,
      })),
      averageOrdersPerHour: parseFloat(avgOrdersPerHour).toFixed(2),
      busiestHour: peakHoursList[0]?.hour ? `${peakHoursList[0].hour}:00` : 'No data',
    });
  } catch (error) {
    console.error('[ADMIN ANALYTICS PEAK HOURS ERROR]', error);
    return serverError(res, error);
  }
};