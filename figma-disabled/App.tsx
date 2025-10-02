import { useState } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { BookingCalendar } from "./components/booking-calendar";
import { TimeSlots } from "./components/time-slots";
import { BookingForm } from "./components/booking-form";
import { Separator } from "./components/ui/separator";
import {
  Calendar,
  Shield,
  Users,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react";

// 页面状态类型
type PageState = "login" | "register" | "logged-in";

export default function App() {
  const [pageState, setPageState] =
    useState<PageState>("login");
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    null,
  );
  const [selectedTime, setSelectedTime] = useState<
    string | null
  >(null);

  // 登录表单状态
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // 注册表单状态
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    // 模拟登录请求
    setTimeout(() => {
      console.log("登录信息:", {
        email: loginEmail,
        password: loginPassword,
      });
      setLoginLoading(false);
      setPageState("logged-in");
    }, 1000);
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);

    // 模拟注册请求
    setTimeout(() => {
      console.log("注册信息:", {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });
      setRegisterLoading(false);
      setPageState("logged-in");
    }, 1000);
  };

  // 退出登录
  const handleLogout = () => {
    setPageState("login");
    setSelectedDate(null);
    setSelectedTime(null);
    // 清空表单数据
    setLoginEmail("");
    setLoginPassword("");
    setRegisterEmail("");
    setRegisterPassword("");
    setConfirmPassword("");
    setRegisterName("");
  };

  // 渲染登录页面
  const renderLoginPage = () => (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 导航栏 */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground text-sm font-semibold">
                  咨
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  专业咨询预约
                </h1>
                <p className="text-xs text-text-secondary">
                  Professional Consultation Booking
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageState("register")}
                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                注册
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 - 居中的登录表单 */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border shadow-xl">
            <CardHeader className="text-center space-y-4 pb-6">
              <div>
                <CardTitle className="text-3xl font-semibold text-foreground mb-2">
                  欢迎回来
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  请登录您的账户以继续使用咨询预约服务
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleLogin}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="login-email"
                    className="text-sm font-medium text-foreground"
                  >
                    邮箱
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="请输入您的邮箱"
                    value={loginEmail}
                    onChange={(e) =>
                      setLoginEmail(e.target.value)
                    }
                    required
                    className="bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="login-password"
                    className="text-sm font-medium text-foreground"
                  >
                    密码
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="请输入密码"
                    value={loginPassword}
                    onChange={(e) =>
                      setLoginPassword(e.target.value)
                    }
                    required
                    className="bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-primary-foreground font-medium h-11 shadow-lg transition-all duration-200"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin pl-[1rem] pr-[1rem]"></div>
                      登录中...
                    </div>
                  ) : (
                    "登录"
                  )}
                </Button>

                <div className="text-center">
                  <a
                    href="#"
                    className="text-sm text-text-secondary hover:text-primary transition-colors duration-200"
                  >
                    忘记密码？
                  </a>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-text-muted">
                      或
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm text-text-secondary">
                  还没有账户？{" "}
                  <button
                    type="button"
                    onClick={() => setPageState("register")}
                    className="text-primary hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    立即注册
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );

  // 渲染注册页面
  const renderRegisterPage = () => (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 导航栏 */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground text-sm font-semibold">
                  咨
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  专业咨询预约
                </h1>
                <p className="text-xs text-text-secondary">
                  Professional Consultation Booking
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageState("login")}
                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 - 居中的注册表单 */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border shadow-xl">
            <CardHeader className="text-center space-y-4 pb-6">
              <div>
                <CardTitle className="text-3xl font-semibold text-foreground mb-2">
                  创建账户
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  注册新账户，开始您的专业咨询之旅
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleRegister}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="register-name"
                    className="text-sm font-medium text-foreground"
                  >
                    姓名
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="请输入您的真实姓名"
                    value={registerName}
                    onChange={(e) =>
                      setRegisterName(e.target.value)
                    }
                    required
                    className="bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="register-email"
                    className="text-sm font-medium text-foreground"
                  >
                    邮箱
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="请输入您的邮箱"
                    value={registerEmail}
                    onChange={(e) =>
                      setRegisterEmail(e.target.value)
                    }
                    required
                    className="bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="register-password"
                    className="text-sm font-medium text-foreground"
                  >
                    密码
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="请设置安全密码"
                    value={registerPassword}
                    onChange={(e) =>
                      setRegisterPassword(e.target.value)
                    }
                    required
                    className="bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-sm font-medium text-foreground"
                  >
                    确认密码
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="请再次输入密码"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    className={`bg-input-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 h-11 ${
                      confirmPassword &&
                      registerPassword !== confirmPassword
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                        : ""
                    }`}
                  />
                  {registerPassword &&
                    confirmPassword &&
                    registerPassword !== confirmPassword && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        密码不匹配
                      </p>
                    )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-primary-foreground font-medium h-11 shadow-lg transition-all duration-200"
                  disabled={
                    registerLoading ||
                    registerPassword !== confirmPassword
                  }
                >
                  {registerLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      注册中...
                    </div>
                  ) : (
                    "创建账户"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-text-muted">
                      或
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm text-text-secondary">
                  已有账户？{" "}
                  <button
                    type="button"
                    onClick={() => setPageState("login")}
                    className="text-primary hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    立即登录
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );

  // 渲染已登录的主页面
  const renderMainPage = () => (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground text-sm font-semibold">
                  咨
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  专业咨询预约
                </h1>
                <p className="text-xs text-text-secondary">
                  Professional Consultation Booking
                </p>
              </div>
            </div>

            {/* 已登录导航按钮 */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-text-secondary">
                欢迎回来
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero 区域 */}
        <section className="text-center mb-16 relative">
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight">
              专业<span className="text-primary">咨询</span>服务
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
              预约专业咨询师，获得个性化的解决方案和专业建议
            </p>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-text-secondary mt-8">
              {[
                { icon: Users, text: "一对一专业咨询" },
                { icon: Clock, text: "灵活时间安排" },
                { icon: Shield, text: "专业资质认证" },
              ].map((feature, index) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-primary/10 transition-colors duration-200"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 预约系统主体 */}
        <section className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* 左侧：日历和时间选择 */}
            <div className="space-y-6">
              <BookingCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />

              {selectedDate && (
                <div>
                  <TimeSlots
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                  />
                </div>
              )}
            </div>

            {/* 右侧：预约表单 */}
            <div>
              <BookingForm
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            </div>
          </div>
        </section>

        {/* 服务特色 */}
        <section className="mt-24 mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              为什么选择我们？
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              我们致力于提供最专业、最贴心的咨询服务
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "专业资质",
                description:
                  "所有咨询师均具备相关专业资质认证，拥有丰富的实践经验",
              },
              {
                icon: Users,
                title: "个性化服务",
                description:
                  "根据您的具体需求量身定制咨询方案，提供针对性的专业建议",
              },
              {
                icon: CheckCircle,
                title: "隐私保护",
                description:
                  "严格保护客户隐私，所有咨询内容完全保密，让您安心咨询",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-card/70 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 联系我们 */}
        <section className="bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-sm p-12 rounded-2xl border border-border/50 text-center relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              还有疑问？
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              如果您对我们的服务有任何疑问，或需要了解更多信息，请随时联系我们的客服团队
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg text-lg px-8"
              >
                在线客服
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-lg px-8"
              >
                查看更多信息
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">
                    咨
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  专业咨询
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                专业、可靠、贴心的咨询服务平台
              </p>
            </div>

            <div>
              <h4 className="text-foreground font-medium mb-4">
                服务
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    个人咨询
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    企业咨询
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    在线咨询
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-medium mb-4">
                支持
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    帮助中心
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    联系我们
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    常见问题
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-medium mb-4">
                公司
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    关于我们
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    隐私政策
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    服务条款
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 专业咨询平台. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );

  // 根据页面状态渲染不同的页面
  switch (pageState) {
    case "login":
      return renderLoginPage();
    case "register":
      return renderRegisterPage();
    case "logged-in":
      return renderMainPage();
    default:
      return renderLoginPage();
  }
}