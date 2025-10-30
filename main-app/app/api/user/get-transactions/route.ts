import { getCurrentUser } from '@/actions/user-actions';
import { connectToMongoDB } from '@/lib/connectToMongoDB';
import Transaction from '@/models/transaction';
import { NextRequest, NextResponse } from 'next/server';

interface TransactionQuery {
  user: string;
  $or?: Array<{
    apartment?: { $regex: string; $options: string };
    transactionId?: { $regex: string; $options: string };
    type?: { $regex: string; $options: string };
  }>;
  createdAt?: {
    $gte?: string;
    $lte?: string;
  };
  status?: string;
  type?: string;
  paymentMethod?: string;
}

export const GET = async (request: NextRequest) => {
  try {
    await connectToMongoDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const paymentMethod = searchParams.get('paymentMethod');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: TransactionQuery = { user: currentUser._id };

    // Search filter
    if (searchQuery) {
      query.$or = [
        { apartment: { $regex: searchQuery, $options: 'i' } },
        { transactionId: { $regex: searchQuery, $options: 'i' } },
        { type: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / limit);

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalTransactions,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}