import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Star, ArrowLeft, Loader2, MessageSquare, TrendingUp,
    Filter, ChevronDown, User as UserIcon, Calendar, Building2
} from 'lucide-react';
import { getAllFeedback, getDepartments } from '../../services/api';

const AdminFeedback = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, distribution: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        department: '',
        rating: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filters]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const { data } = await getDepartments();
            setDepartments(data.departments || []);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (filters.department) params.department = filters.department;
            if (filters.rating) params.rating = filters.rating;

            const { data } = await getAllFeedback(params);
            setFeedbacks(data.feedbacks || []);
            setStats(data.stats || { averageRating: 0, totalReviews: 0, distribution: [] });
        } catch (error) {
            console.error('Failed to fetch feedback:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRatingColor = (rating) => {
        if (rating >= 4) return 'text-emerald-600 bg-emerald-50';
        if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getDistributionPercentage = (count) => {
        if (stats.totalReviews === 0) return 0;
        return Math.round((count / stats.totalReviews) * 100);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-3 bg-white hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Patient Feedback</h1>
                            <p className="text-slate-500 text-sm">View and analyze patient reviews</p>
                        </div>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                            <select
                                value={filters.department}
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Rating</label>
                            <select
                                value={filters.rating}
                                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setFilters({ department: '', rating: '' })}
                            className="self-end px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Average Rating */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-slate-500">Average Rating</span>
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900">{stats.averageRating}</span>
                            <span className="text-slate-400 font-medium">/ 5</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    size={18}
                                    className={stats.averageRating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Total Reviews */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-slate-500">Total Reviews</span>
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-4xl font-black text-slate-900">{stats.totalReviews}</div>
                        <p className="text-sm text-slate-400 mt-1">All-time feedback</p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-sm font-semibold text-slate-500">Distribution</span>
                        <div className="mt-3 space-y-2">
                            {[5, 4, 3, 2, 1].map(rating => {
                                const ratingData = stats.distribution.find(d => d._id === rating) || { count: 0 };
                                const percentage = getDistributionPercentage(ratingData.count);
                                return (
                                    <div key={rating} className="flex items-center gap-2 text-xs">
                                        <span className="w-3 text-slate-500">{rating}</span>
                                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="w-8 text-right text-slate-400">{percentage}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Feedback List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-slate-400 font-medium">Loading feedback...</p>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 mb-1">No Feedback Yet</h3>
                        <p className="text-slate-400">Patient feedback will appear here once submitted.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedbacks.map(feedback => (
                            <div
                                key={feedback._id}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Left: Patient & Comment */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    {feedback.patient?.name || 'Anonymous'}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {feedback.patient?.email}
                                                </p>
                                            </div>
                                        </div>

                                        {feedback.comment && (
                                            <p className="text-slate-600 leading-relaxed mb-3 pl-13">
                                                "{feedback.comment}"
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                            {feedback.department && (
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {feedback.department.name}
                                                </span>
                                            )}
                                            {feedback.doctor && (
                                                <span className="flex items-center gap-1">
                                                    <UserIcon className="w-3 h-3" />
                                                    Dr. {feedback.doctor.name}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(feedback.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Rating */}
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getRatingColor(feedback.rating)}`}>
                                        <span className="text-2xl font-black">{feedback.rating}</span>
                                        <Star className="w-5 h-5 fill-current" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFeedback;
