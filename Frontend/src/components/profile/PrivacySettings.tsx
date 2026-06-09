import { Shield, Bell, ShieldBan } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const showComingSoon = () => {
  toast.info("Chức năng này đang được phát triển.");
};

const PrivacySettings = () => (
  <Card className="glass-strong border-border/30">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        Quyền riêng tư và bảo mật
      </CardTitle>
      <CardDescription>
        Quản lý cài đặt quyền riêng tư và bảo mật của bạn
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-6">
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start glass-light border-border/30 hover:text-warning"
          onClick={showComingSoon}
        >
          <Shield className="h-4 w-4 mr-2" />
          Đổi mật khẩu
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full justify-start glass-light border-border/30 hover:text-info"
          onClick={showComingSoon}
        >
          <Bell className="h-4 w-4 mr-2" />
          Cài đặt thông báo
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full justify-start glass-light border-border/30 hover:text-destructive"
          onClick={showComingSoon}
        >
          <ShieldBan className="size-4 mr-2" />
          Chặn và báo cáo
        </Button>
      </div>

      <div className="pt-4 border-t border-border/30">
        <h4 className="font-medium mb-3 text-destructive">Khu vực nguy hiểm</h4>
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={showComingSoon}
        >
          Xóa tài khoản
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default PrivacySettings;
