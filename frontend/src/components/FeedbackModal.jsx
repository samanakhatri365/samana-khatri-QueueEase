import React, { useState } from 'react';
import { Star, X, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import { submitFeedback } from '../services/api';

const FeedbackModal = ({ isOpen, onClose, tokenId, doctorName, departmentName }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await submitFeedback({ tokenId, rating, comment });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRatingText = (r) => {
        switch (r) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return 'Select rating';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {!submitted ? (
                    <>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary to-emerald-600 p-6 text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="text-center">
                                <div className="inline-block p-3 bg-white/20 rounded-full mb-3">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold">Rate Your Experience</h2>
                                <p className="text-emerald-100 text-sm mt-1">
                                    How was your visit with {doctorName || 'the doctor'}?
                                </p>
                                {departmentName && (
                                    <p className="text-emerald-200 text-xs mt-1">{departmentName}</p>
                                )}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                                    {error}
                                </div>
                            )}

                            {/* Star Rating */}
                            <div className="text-center mb-6">
                                <div className="flex justify-center gap-2 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                size={40}
                                                className={`transition-colors ${
                                                    (hoverRating || rating) >= star
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-slate-200'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className={`text-sm font-semibold transition-colors ${
                                    rating > 0 ? 'text-yellow-600' : 'text-slate-400'
                                }`}>
                                    {getRatingText(hoverRating || rating)}
                                </p>
                            </div>

                            {/* Comment */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Share your thoughts (optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you like or what could be improved?"
                                    maxLength={500}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-colors text-sm"
                                />
                                <p className="text-right text-xs text-slate-400 mt-1">
                                    {comment.length}/500
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-colors"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={rating === 0 || isSubmitting}
                                    className="flex-1 py-3 px-4 bg-primary hover:bg-emerald-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Review'
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Success State */
                    <div className="p-10 text-center">
                        <div className="inline-block p-4 bg-emerald-100 rounded-full mb-4">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
                        <p className="text-slate-500">
                            Your feedback helps us improve our services.
                        </p>
                        <div className="flex justify-center gap-1 mt-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={24}
                                    className={rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
