import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface RegisterDialogProps {
  children: React.ReactNode;
}

export function RegisterDialog({ children }: RegisterDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      alert("两次输入的密码不一致");
      setIsLoading(false);
      return;
    }

    // 模拟注册请求
    setTimeout(() => {
      console.log("注册信息:", formData);
      setIsLoading(false);
      setOpen(false);
      // 这里可以添加实际的注册逻辑
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>创建账户</DialogTitle>
          <DialogDescription>
            填写以下信息来创建您的新账户
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              required
              className="bg-input-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">邮箱</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="请输入您的邮箱"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="bg-input-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">密码</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              className="bg-input-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">确认密码</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
              className="bg-input-background border-border"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "注册中..." : "注册"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            注册即表示您同意我们的
            <a href="#" className="hover:text-primary transition-colors"> 服务条款 </a>
            和
            <a href="#" className="hover:text-primary transition-colors"> 隐私政策</a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}