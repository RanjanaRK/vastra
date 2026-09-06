import type { Request, Response } from "express";
import mongoose from "mongoose";
import paymentModel from "../model/payment.model.js";
import productModel from "../model/product.model.js";
import { reviewModel } from "../model/review.model.js";
import { reviewSummaryModel } from "../model/reviewSummary.model.js";
import { generateReviewSummary } from "../service/ai.service.js";
import type { JwtUser } from "../utils/types.js";

export const createReviewController = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params as { productId: string };
    const { rating, reviewComment } = req.body;
    const user = req.user as JwtUser;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const boughtProduct = await paymentModel.findOne({
      user: user.id,
      "orderItems.productId": productId,
    });

    if (!boughtProduct) {
      return res.status(403).json({
        message: "You haven't bought this product",
      });
    }

    const existingReview = await reviewModel.findOne({
      product: productId,
      user: user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    const review = await reviewModel.create({
      user: user.id,
      product: productId,
      rating,
      reviewComment,
    });

    const reviewCount = await reviewModel.countDocuments({
      product: productId,
    });

    let summary = null;

    const reviewReminder = reviewCount % 5 === 0;

    if (reviewCount >= 5 && reviewReminder) {
      const reviews = await reviewModel
        .find({ product: productId })
        .select("rating reviewComment");

      const result = await generateReviewSummary({
        product,
        reviews,
      });

      const cleanJson = result
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      summary = JSON.parse(cleanJson || "{}");

      const updateReviewSummary = await reviewSummaryModel.findOneAndUpdate(
        { product: productId },
        {
          $set: {
            product: productId,
            summary: summary.summary,
            pros: summary.pros,
            cons: summary.cons,
            generatedFromReviewCount: reviewCount,
            generatedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
        },
      );
    }

    return res.status(201).json({
      success: true,
      message: "Review posted successfully",
      review,
      reviewCount,
      summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getProductReviewsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productId } = req.params as { productId: string };

    const reviews = await reviewModel
      .find({ product: productId })
      .populate("user", "email fullname role")
      .sort({ createdAt: -1 });

    const reviewStats = await reviewModel.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
              },
            },
          ],

          breakdown: [
            {
              $group: {
                _id: "$rating",
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                _id: -1,
              },
            },
          ],
        },
      },
    ]);

    const stats = reviewStats[0];

    const summary = stats.summary[0] || {
      averageRating: 0,
      reviewCount: 0,
    };

    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      reviews,
      reviewStats: {
        averageRating: Number(summary.averageRating.toFixed(1)),
        reviewCount: summary.reviewCount,
        breakdown: stats.breakdown,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteReviewController = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const user = req.user as JwtUser;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    let reviewByUser = review.user.toString() !== user.id;

    if (reviewByUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await reviewModel.deleteOne({ _id: reviewId });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateReviewController = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { rating, reviewComment } = req.body;

    const user = req.user as JwtUser;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    review.rating = rating;

    review.reviewComment = reviewComment;

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const regenerateReviewSummaryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productId } = req.params as { productId: string };

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviews = await reviewModel
      .find({ product: productId })
      .select("rating reviewComment");

    if (reviews.length < 5) {
      return res.status(400).json({
        success: false,
        message: "At least 5 reviews are required",
      });
    }

    const result = await generateReviewSummary({
      product,
      reviews,
    });

    const cleanJson = result
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const summary = JSON.parse(cleanJson || "{}");

    const savedSummary = await reviewSummaryModel.findOneAndUpdate(
      { product: productId },
      {
        $set: {
          product: productId,
          summary: summary.summary,
          pros: summary.positivePoints,
          cons: summary.negativePoints,
          generatedFromReviewCount: reviews.length,
          generatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "AI review summary regenerated successfully",
      savedSummary,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getReviewSummaryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productId } = req.params as { productId: string };

    const summary = await reviewSummaryModel.findOne({
      product: productId,
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Review summary not available",
      });
    }

    return res.status(200).json({
      success: true,
      message: "AI review summary generated successfully",
      summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
