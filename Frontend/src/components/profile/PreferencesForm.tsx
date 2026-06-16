import { Sun, Moon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useThemeStore } from "@/stores/useThemeStore";

const PreferencesForm = () => {
  const { isDark, setTheme } = useThemeStore();
  return (
    <Card className="glass-strong border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-primary" />
          Tùy chỉnh ứng dụng
        </CardTitle>
        <CardDescription>
          Cá nhân hóa trải nghiệm trò chuyện của bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label
              htmlFor="theme-toggle"
              className="text-base font-medium"
            >
              Chế độ tối
            </Label>
            <p className="text-sm text-muted-foreground">
              Chuyển đổi giữa giao diện sáng và tối
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sun
              className={`size-4 ${
                !isDark ? "text-yellow-500" : "text-muted-foreground"
              }`}
            />

            <Switch
              aria-label="Toggle dark mode"
              checked={isDark}
              onCheckedChange={setTheme}
              className="data-[state=checked]:bg-primary"
            />

            <Moon
              className={`size-4 ${
                isDark ? "text-blue-400" : "text-muted-foreground"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
