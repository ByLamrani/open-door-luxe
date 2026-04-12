import { motion } from "framer-motion";
import { Clock, RefreshCw, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WearTimePredictorProps {
  bottleSizeMl?: number;
  productName: string;
  purchaseDate: string;
  onRefill?: () => void;
}

const WearTimePredictor = ({ bottleSizeMl, productName, purchaseDate, onRefill }: WearTimePredictorProps) => {
  if (!bottleSizeMl) return null;

  // Calculation: average 2 sprays/day, ~10 sprays per ml
  const totalSprays = bottleSizeMl * 10;
  const daysOfUse = Math.round(totalSprays / 2);
  const purchaseDateObj = new Date(purchaseDate);
  const emptyDate = new Date(purchaseDateObj);
  emptyDate.setDate(emptyDate.getDate() + daysOfUse);

  const today = new Date();
  const daysUsed = Math.floor((today.getTime() - purchaseDateObj.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, daysOfUse - daysUsed);
  const percentUsed = Math.min(100, Math.round((daysUsed / daysOfUse) * 100));
  const percentRemaining = 100 - percentUsed;

  const isLow = percentRemaining <= 15;
  const isNearEmpty = percentRemaining <= 5;
  const refillWarning = percentRemaining <= 25;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 ${isLow ? "border-destructive/50 bg-destructive/5" : "border-border"}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Droplets className={`w-4 h-4 ${isLow ? "text-destructive" : "text-gold"}`} />
        <span className="font-display text-sm text-foreground">Wear-Time Tracker</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-body text-muted-foreground">
          <span>{bottleSizeMl}ml bottle</span>
          <span>~{percentRemaining}% remaining</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentUsed}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isNearEmpty ? "bg-destructive" : isLow ? "bg-orange-500" : "bg-gold"
            }`}
          />
        </div>

        <div className="flex justify-between text-xs font-body text-muted-foreground">
          <span>Purchased {purchaseDateObj.toLocaleDateString()}</span>
          <span>~{daysRemaining} days left</span>
        </div>

        {refillWarning && (
          <div className="mt-3 p-3 bg-gold/10 rounded-lg">
            <p className="text-xs font-body text-foreground mb-2">
              <Clock className="w-3 h-3 inline mr-1" />
              {isNearEmpty
                ? `Your ${productName} is nearly empty!`
                : `Your ${productName} is running low.`}
              {" "}Auto-refill for <span className="text-gold font-semibold">15% off</span>?
            </p>
            {onRefill && (
              <Button variant="gold" size="sm" onClick={onRefill} className="w-full text-xs">
                <RefreshCw className="w-3 h-3 mr-1" /> Auto-Refill & Save 15%
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WearTimePredictor;
