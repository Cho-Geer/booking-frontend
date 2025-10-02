import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle, AlertCircle, User, Phone, Mail, MessageSquare, Calendar, Clock } from "lucide-react";

interface BookingFormProps {
  selectedDate: Date | null;
  selectedTime: string | null;
}

export function BookingForm({ selectedDate, selectedTime }: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    wechat: "",
    email: "",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除相关错误信息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // 验证手机号格式
  const validatePhone = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "请输入姓名";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "请输入手机号码";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "请输入有效的手机号码";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    if (!selectedDate) {
      newErrors.date = "请选择预约日期";
    }

    if (!selectedTime) {
      newErrors.time = "请选择预约时间";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // 模拟提交请求
    setTimeout(() => {
      console.log("预约信息:", {
        ...formData,
        date: selectedDate?.toLocaleDateString(),
        time: selectedTime,
        submittedAt: new Date().toISOString(),
        ipAddress: "127.0.0.1" // 模拟IP地址
      });
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  // 成功页面
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full bg-card/90 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              {/* 成功图标动画 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto relative">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                  {/* 光圈效果 */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-green-500/30"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                
                {/* 装饰星星 */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  transition={{ delay: 0.5, duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-semibold text-foreground mb-3">预约提交成功！</h3>
                <p className="text-text-secondary text-lg">
                  我们已收到您的预约申请，工作人员会在24小时内与您联系确认详细信息。
                </p>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    预约确认短信已发送至您的手机，请注意查收。如有紧急情况，请直接联系客服热线。
                  </AlertDescription>
                </Alert>
              </motion.div>
              
              <motion.div 
                className="space-y-3 text-sm bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  预约详情确认
                </div>
                <div className="grid grid-cols-1 gap-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">预约日期</span>
                    <span className="font-medium text-foreground">{selectedDate?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">预约时间</span>
                    <span className="font-medium text-foreground">{selectedTime?.replace("-", " - ")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">联系人</span>
                    <span className="font-medium text-foreground">{formData.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">手机号</span>
                    <span className="font-medium text-foreground">{formData.phone}</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="w-full h-12 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  继续预约其他时间
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="w-full bg-card/90 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold text-foreground">填写个人信息</CardTitle>
          </div>
          <motion.p 
            className="text-sm text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            请填写您的联系信息，我们将根据这些信息与您确认预约详情
          </motion.p>
        </CardHeader>
        
        <CardContent>
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                姓名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="请输入您的真实姓名"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className={`bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-11 ${errors.name ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p 
                    className="text-sm text-destructive flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                手机号码 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入11位手机号码"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className={`bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-11 ${errors.phone ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
              />
              <AnimatePresence>
                {errors.phone && (
                  <motion.p 
                    className="text-sm text-destructive flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Label htmlFor="wechat" className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                微信号（选填）
              </Label>
              <Input
                id="wechat"
                type="text"
                placeholder="请输入您的微信号"
                value={formData.wechat}
                onChange={(e) => handleInputChange("wechat", e.target.value)}
                className="bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-11"
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                邮箱地址（选填）
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入您的邮箱地址"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-11 ${errors.email ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p 
                    className="text-sm text-destructive flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Label htmlFor="notes" className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                咨询内容备注（选填）
              </Label>
              <Textarea
                id="notes"
                placeholder="请简要描述您希望咨询的问题或需求，以便我们为您安排合适的专家"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 min-h-[120px] resize-none"
                rows={4}
              />
              <p className="text-xs text-text-secondary">
                填写具体需求有助于我们提供更精准的服务
              </p>
            </motion.div>

            {/* 预约信息确认 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {selectedDate && selectedTime ? (
                  <motion.div 
                    className="p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-sm space-y-3">
                      <div className="flex items-center gap-2 font-semibold text-green-800 mb-3">
                        <CheckCircle className="w-4 h-4" />
                        预约信息确认
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            日期
                          </span>
                          <span className="font-medium text-green-800">{selectedDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            时间
                          </span>
                          <span className="font-medium text-green-800">{selectedTime.replace("-", " - ")}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        请先选择预约日期和时间
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 错误提示 */}
            <AnimatePresence>
              {(errors.date || errors.time) && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.date || errors.time}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-primary-foreground font-medium h-12 shadow-lg transition-all duration-200"
                disabled={isLoading || !selectedDate || !selectedTime}
              >
                {isLoading ? (
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    提交中...
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    确认预约
                  </div>
                )}
              </Button>
            </motion.div>

            <motion.p 
              className="text-xs text-text-secondary text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              提交预约即表示您同意我们的{" "}
              <a href="#" className="text-primary hover:text-primary-600 transition-colors">服务条款</a> 和{" "}
              <a href="#" className="text-primary hover:text-primary-600 transition-colors">隐私政策</a>
            </motion.p>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  );
}