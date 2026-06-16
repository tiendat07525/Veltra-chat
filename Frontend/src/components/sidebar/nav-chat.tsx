import { MoreHorizontal, Info, Pin, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ChatCardMenuProps {
  onDelete?: () => void;
}

export default function ChatCardMenu({onDelete}: ChatCardMenuProps) {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-smooth"
            >
            <MoreHorizontal className="size-4 text-muted-foreground" />
            </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
            align="center"
            side="right"
            sideOffset={24}
            className="min-w-48 rounded-lg"
        >
            <DropdownMenuGroup>
            <DropdownMenuItem
                onClick={(e) => {
                e.stopPropagation();
                }}
            >
                <Info className="text-muted-foreground" />
                Thông tin
            </DropdownMenuItem>

            <DropdownMenuItem
                onClick={(e) => {
                e.stopPropagation();
                }}
            >
                <Pin className="text-muted-foreground" />
                Ghim cuộc trò chuyện
            </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
            variant="destructive"
            onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
            }}
            >
            <Trash2 />
            Xóa cuộc trò chuyện
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}