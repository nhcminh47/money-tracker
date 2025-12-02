/**
 * AI-powered transaction categorization using TensorFlow.js
 * This service learns from user's historical transactions to suggest categories
 */

import * as tf from '@tensorflow/tfjs';
import { db } from '@/lib/db';

interface CategorySuggestion {
  categoryId: string;
  confidence: number;
  categoryName: string;
}

interface TrainingData {
  description: string;
  categoryId: string;
}

// Simple feature extraction from transaction description
function extractFeatures(description: string): number[] {
  const desc = description.toLowerCase();
  const features: number[] = [];
  
  // Common transaction keywords as features
  const keywords = [
    'grocery', 'food', 'restaurant', 'gas', 'fuel',
    'shopping', 'clothes', 'entertainment', 'movie', 'coffee',
    'rent', 'utility', 'electric', 'water', 'internet',
    'salary', 'income', 'paycheck', 'transfer', 'payment'
  ];
  
  // Binary features: 1 if keyword present, 0 otherwise
  keywords.forEach(keyword => {
    features.push(desc.includes(keyword) ? 1 : 0);
  });
  
  // Additional features
  features.push(desc.length / 100); // Normalized length
  features.push(desc.split(' ').length / 10); // Normalized word count
  
  return features;
}

// Create a simple neural network for categorization
function createModel(numCategories: number): tf.LayersModel {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [22], units: 32, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 16, activation: 'relu' }),
      tf.layers.dense({ units: numCategories, activation: 'softmax' })
    ]
  });
  
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  return model;
}

let cachedModel: tf.LayersModel | null = null;
let categoryMapping: Map<number, string> = new Map();

/**
 * Train the categorization model on user's historical transactions
 */
export async function trainCategorizationModel(): Promise<void> {
  try {
    // Get historical transactions with categories
    const transactions = await db.transactions
      .where('categoryId')
      .notEqual('')
      .toArray();
    
    if (transactions.length < 10) {
      console.log('Not enough training data (need at least 10 transactions)');
      return;
    }
    
    // Get all categories
    const categories = await db.categories.toArray();
    const categoryIds = [...new Set(transactions.map(t => t.categoryId).filter((id): id is string => Boolean(id)))];
    
    // Create category mapping
    categoryMapping.clear();
    categoryIds.forEach((id, index) => {
      categoryMapping.set(index, id);
    });
    
    // Prepare training data
    const features: number[][] = [];
    const labels: number[][] = [];
    
    transactions.forEach(transaction => {
      if (!transaction.categoryId) return;
      
      const featureVector = extractFeatures(transaction.notes || '');
      const categoryIndex = categoryIds.indexOf(transaction.categoryId);
      
      if (categoryIndex >= 0) {
        features.push(featureVector);
        
        // One-hot encode the category
        const labelVector = new Array(categoryIds.length).fill(0);
        labelVector[categoryIndex] = 1;
        labels.push(labelVector);
      }
    });
    
    if (features.length < 5) {
      console.log('Not enough valid training samples');
      return;
    }
    
    // Create and train model
    const model = createModel(categoryIds.length);
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);
    
    await model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.acc.toFixed(4)}`);
          }
        }
      }
    });
    
    // Clean up tensors
    xs.dispose();
    ys.dispose();
    
    // Cache the model
    cachedModel = model;
    
    console.log('Model trained successfully');
  } catch (error) {
    console.error('Error training model:', error);
  }
}

/**
 * Suggest category for a transaction based on description
 */
export async function suggestCategory(description: string): Promise<CategorySuggestion[]> {
  if (!cachedModel) {
    await trainCategorizationModel();
  }
  
  if (!cachedModel || categoryMapping.size === 0) {
    return [];
  }
  
  try {
    const features = extractFeatures(description);
    const input = tf.tensor2d([features]);
    const prediction = cachedModel.predict(input) as tf.Tensor;
    const probabilities = await prediction.data();
    
    // Clean up tensors
    input.dispose();
    prediction.dispose();
    
    // Get categories with their confidence scores
    const categories = await db.categories.toArray();
    const suggestions: CategorySuggestion[] = [];
    
    Array.from(categoryMapping.entries()).forEach(([index, categoryId]) => {
      const confidence = probabilities[index];
      const category = categories.find(c => c.id === categoryId);
      
      if (category && confidence > 0.1) { // Only include if confidence > 10%
        suggestions.push({
          categoryId,
          confidence,
          categoryName: category.name
        });
      }
    });
    
    // Sort by confidence (highest first)
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    // Return top 3 suggestions
    return suggestions.slice(0, 3);
  } catch (error) {
    console.error('Error suggesting category:', error);
    return [];
  }
}

/**
 * Store user feedback to improve future suggestions
 */
export async function recordCategoryFeedback(
  description: string,
  suggestedCategoryId: string,
  actualCategoryId: string,
  accepted: boolean
): Promise<void> {
  // In a more advanced implementation, you could:
  // 1. Store this feedback in IndexedDB
  // 2. Use it to retrain the model periodically
  // 3. Implement online learning to update weights incrementally
  
  console.log('Category feedback recorded:', {
    description,
    suggestedCategoryId,
    actualCategoryId,
    accepted
  });
  
  // If user frequently rejects suggestions, retrain the model
  if (!accepted && cachedModel) {
    // Consider retraining after collecting enough feedback
    // For now, just log it
  }
}

/**
 * Clear cached model (useful when user data changes significantly)
 */
export function clearCategorizationCache(): void {
  if (cachedModel) {
    cachedModel.dispose();
    cachedModel = null;
  }
  categoryMapping.clear();
}
