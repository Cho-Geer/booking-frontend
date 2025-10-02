import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, CheckCircle, XCircle, Sun, Sunset } from "lucide-react";

const TIME_SLOTS = [
  { start: "09:00", end: "09:30", available: true },
  { start: "09:30", end: "10:00", available: false },
  { start: "10:00", end: "10:30", available: true },
  { start: "10:30", end: "11:00", available: true },
  { start: "11:00", end: "11:30", available: false },
  { start: "11:30", end: "12:00", available: true },
  { start: "14:00", end: "14:30", available: true },
  { start: "14:30", end: "15:00", available: true },
  { start: "15:00", end: "15:30", available: false },
  { start: "15:30", end: "16:00", available: true },
  { start: "16:00", end: "16:30", available: true },
  { start: "16:30", end: "17:00", available: true },
];

interface TimeSlotsProps {
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export function TimeSlots({ selectedTime, onTimeSelect }: TimeSlotsProps) {
  const availableSlots = TIME_SLOTS.filter(slot => slot.available);
  const bookedSlots = TIME_SLOTS.filter(slot => !slot.available);

  return (
    <Card className="w-full bg-card/90 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">选择咨询时间</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs bg-primary/5 border-primary/30 text-primary">
              {availableSlots.length} 个可选
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary-600 rounded-full shadow-sm"></div>
              <span className="text-text-secondary">可预约</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded-full"></div>
              <span className="text-text-secondary">已预约</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
              <span className="text-text-secondary">已选择</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* 上午时间段 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-yellow-100 rounded-lg">
                    <Sun className="w-4 h-4 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-foreground text-lg">上午</h4>
                </div>
                <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                  {TIME_SLOTS.filter(slot => slot.start.startsWith('0') || (slot.start.startsWith('1') && parseInt(slot.start.split(':')[0]) < 12)).filter(slot => slot.available).length} 个可选
                </Badge>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.filter(slot => slot.start.startsWith('0') || (slot.start.startsWith('1') && parseInt(slot.start.split(':')[0]) < 12)).map((slot, index) => {
                  const timeKey = `${slot.start}-${slot.end}`;
                  const isSelected = selectedTime === timeKey;
                  
                  return (
                    <motion.div
                      key={timeKey}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={slot.available ? { scale: 1.05 } : {}}
                      whileTap={slot.available ? { scale: 0.95 } : {}}
                    >
                      <Button
                        variant={isSelected ? "default" : slot.available ? "outline" : "secondary"}
                        size="sm"
                        disabled={!slot.available}
                        className={`h-16 text-xs transition-all duration-300 relative overflow-hidden ${
                          isSelected 
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-green-500 shadow-lg ring-2 ring-green-500/30" 
                            : slot.available
                            ? "bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/50 border-border/50 backdrop-blur-sm"
                            : "bg-muted/50 text-text-muted cursor-not-allowed opacity-60"
                        }`}
                        onClick={() => slot.available && onTimeSelect(timeKey)}
                      >
                        <div className="flex flex-col items-center gap-1 relative z-10">
                          <div className="font-semibold">{slot.start}</div>
                          <div className="text-[10px] opacity-70">-</div>
                          <div className="font-semibold">{slot.end}</div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              <CheckCircle className="w-3 h-3 mt-1" />
                            </motion.div>
                          )}
                          {!slot.available && <XCircle className="w-3 h-3 mt-1 opacity-60" />}
                        </div>
                        
                        {/* 动画背景效果 */}
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* 下午时间段 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <Sunset className="w-4 h-4 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-foreground text-lg">下午</h4>
                </div>
                <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                  {TIME_SLOTS.filter(slot => slot.start.startsWith('1') && parseInt(slot.start.split(':')[0]) >= 14).filter(slot => slot.available).length} 个可选
                </Badge>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.filter(slot => slot.start.startsWith('1') && parseInt(slot.start.split(':')[0]) >= 14).map((slot, index) => {
                  const timeKey = `${slot.start}-${slot.end}`;
                  const isSelected = selectedTime === timeKey;
                  
                  return (
                    <motion.div
                      key={timeKey}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      whileHover={slot.available ? { scale: 1.05 } : {}}
                      whileTap={slot.available ? { scale: 0.95 } : {}}
                    >
                      <Button
                        variant={isSelected ? "default" : slot.available ? "outline" : "secondary"}
                        size="sm"
                        disabled={!slot.available}
                        className={`h-16 text-xs transition-all duration-300 relative overflow-hidden ${
                          isSelected 
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-green-500 shadow-lg ring-2 ring-green-500/30" 
                            : slot.available
                            ? "bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/50 border-border/50 backdrop-blur-sm"
                            : "bg-muted/50 text-text-muted cursor-not-allowed opacity-60"
                        }`}
                        onClick={() => slot.available && onTimeSelect(timeKey)}
                      >
                        <div className="flex flex-col items-center gap-1 relative z-10">
                          <div className="font-semibold">{slot.start}</div>
                          <div className="text-[10px] opacity-70">-</div>
                          <div className="font-semibold">{slot.end}</div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              <CheckCircle className="w-3 h-3 mt-1" />
                            </motion.div>
                          )}
                          {!slot.available && <XCircle className="w-3 h-3 mt-1 opacity-60" />}
                        </div>
                        
                        {/* 动画背景效果 */}
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* 提示信息 */}
            <motion.div 
              className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <div className="text-sm text-text-secondary">
                <div className="flex items-center gap-2 font-semibold text-foreground mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  温馨提示
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>每个咨询时段为30分钟</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>建议提前5-10分钟到达或准备</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>如需改期请提前24小时联系客服</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>灰色时间段表示已被预约</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
    </Card>
  );
}