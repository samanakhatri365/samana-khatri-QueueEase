import Token from '../models/Token.js';

export const getDailyStats = async (req, res) => {
  try {
    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Total Tokens Served Today
    const totalServed = await Token.countDocuments({
      status: 'completed',
      updatedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // 2. Tokens per Doctor/Department (For Charts)
    const tokensPerDoctor = await Token.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfDay, $lte: endOfDay } 
        } 
      },
      {
        $group: {
          _id: "$doctor", // Group by Doctor ID
          count: { $sum: 1 } // Count tokens
        }
      },
      {
        $lookup: { // Join with User table to get Doctor Name
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo"
        }
      },
      {
        $project: {
          _id: 1,
          name: { $arrayElemAt: ["$doctorInfo.name", 0] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // 3. Tokens per Department
    const tokensPerDepartment = await Token.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfDay, $lte: endOfDay } 
        } 
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "deptInfo"
        }
      },
      {
        $group: {
          _id: "$department",
          departmentName: { $first: { $arrayElemAt: ["$deptInfo.name", 0] } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // 4. Calculate Average Wait Time
    // We calculate as updatedAt - createdAt for completed tokens
    const waitTimeStats = await Token.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $project: {
          duration: { $subtract: ["$updatedAt", "$createdAt"] } // Difference in milliseconds
        }
      },
      {
        $group: {
          _id: null,
          avgWait: { $avg: "$duration" }
        }
      }
    ]);

    // Convert ms to minutes
    const avgMinutes = waitTimeStats.length > 0 
      ? Math.round(waitTimeStats[0].avgWait / 1000 / 60) 
      : 0;

    // 5. Hourly breakdown for line chart
    const hourlyBreakdown = await Token.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfDay, $lte: endOfDay } 
        } 
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          hour: { $concat: [{ $toString: "$_id" }, ":00"] },
          tokens: "$count"
        }
      }
    ]);

    res.json({
      totalServed,
      avgWaitTime: avgMinutes,
      doctorBreakdown: tokensPerDoctor,
      departmentBreakdown: tokensPerDepartment,
      hourlyData: hourlyBreakdown
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Historic stats for a date range
export const getDateRangeStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const totalServed = await Token.countDocuments({
      status: 'completed',
      updatedAt: { $gte: start, $lte: end }
    });

    const defaultWaitTime = 0;

    const departmentBreakdown = await Token.aggregate([
      { 
        $match: { 
          createdAt: { $gte: start, $lte: end } 
        } 
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "deptInfo"
        }
      },
      {
        $group: {
          _id: "$department",
          departmentName: { $first: { $arrayElemAt: ["$deptInfo.name", 0] } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      totalServed,
      avgWaitTime: defaultWaitTime,
      departmentBreakdown
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
