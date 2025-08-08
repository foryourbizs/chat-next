"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCreateCharacter } from "@/hooks/use-chat-api";
import type { CreateCharacterRequest } from "@/types/chat";

/**
 * 캐릭터 생성 폼 검증 스키마
 */
const createCharacterSchema = z.object({
  name: z
    .string()
    .min(1, "캐릭터 이름을 입력해주세요")
    .max(50, "캐릭터 이름은 50자 이하로 입력해주세요")
    .regex(
      /^[가-힣a-zA-Z0-9\s-_]+$/,
      "한글, 영문, 숫자, 공백, 하이픈, 언더스코어만 사용 가능합니다"
    ),
  description: z
    .string()
    .min(10, "캐릭터 설명을 최소 10자 이상 입력해주세요")
    .max(200, "캐릭터 설명은 200자 이하로 입력해주세요"),
  systemPrompt: z.string().min(1, "시스템 프롬프트를 입력해주세요"),
});

type CreateCharacterFormData = z.infer<typeof createCharacterSchema>;

interface CharacterCreateDialogProps {
  /**
   * 모달 트리거 버튼 (선택사항)
   */
  trigger?: React.ReactNode;
  /**
   * 캐릭터 생성 완료 콜백
   */
  onCharacterCreated?: () => void;
}

/**
 * 캐릭터 생성 다이얼로그 컴포넌트
 */
export function CharacterCreateDialog({
  trigger,
  onCharacterCreated,
}: CharacterCreateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  // React Hook Form 설정
  const form = useForm<CreateCharacterFormData>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
    },
  });

  // 캐릭터 생성 API 훅
  const createCharacterMutation = useCreateCharacter();

  /**
   * 폼 초기화
   */
  const resetForm = () => {
    form.reset();
    setSelectedTemplate(null);
  };

  /**
   * 캐릭터 생성 처리
   */
  const handleCreateCharacter = async (data: CreateCharacterFormData) => {
    try {
      const createData: CreateCharacterRequest = {
        ...data,
        userId: 1, // 현재 하드코딩된 사용자 ID (백엔드 필수)
        isActive: true, // 기본값: 활성 상태
        usageCount: 0, // 기본값: 사용 횟수 0
      };

      await createCharacterMutation.mutateAsync(createData);

      toast.success("새 캐릭터가 생성되었습니다!", {
        description: `"${data.name}" 캐릭터가 성공적으로 생성되었습니다.`,
      });

      // 모달 닫기 및 폼 초기화
      setIsOpen(false);
      resetForm();

      // 생성 완료 콜백 호출
      onCharacterCreated?.();
    } catch (error) {
      console.error("Character creation failed:", error);
      toast.error("캐릭터 생성에 실패했습니다", {
        description: "잠시 후 다시 시도해주세요.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />새 캐릭터 생성
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />새 캐릭터 생성
          </DialogTitle>
          <DialogDescription>
            나만의 AI 캐릭터를 만들어보세요. 성격, 전문성, 대화 스타일을
            자유롭게 설정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {/* 캐릭터 생성 폼 */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateCharacter)}
            className="space-y-4"
          >
            {/* 캐릭터 이름 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>캐릭터 이름 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 친근한 AI 도우미"
                      {...field}
                      className="bg-background"
                    />
                  </FormControl>
                  <FormDescription>
                    캐릭터를 식별할 수 있는 이름을 입력해주세요. (최대 50자)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 캐릭터 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>캐릭터 설명 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="예: 항상 도움을 주려고 하는 친근한 AI 어시스턴트입니다. 복잡한 내용도 쉽게 설명해주고, 따뜻한 톤으로 대화합니다."
                      className="min-h-20 bg-background resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    캐릭터의 특징과 성격을 간단히 설명해주세요. (10-200자)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 시스템 프롬프트 */}
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시스템 프롬프트 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="예: 당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 사용자의 질문에 정확하고 유용한 답변을 제공하며, 항상 예의 바른 톤으로 대화하세요. 복잡한 개념도 쉽게 설명해주고, 필요하면 단계별로 안내해주세요."
                      className="min-h-32 bg-background resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    AI가 어떻게 행동하고 대답할지 구체적으로 지시해주세요. 이
                    프롬프트가 캐릭터의 개성을 결정합니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제출 버튼들 */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={createCharacterMutation.isPending}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={createCharacterMutation.isPending}
              >
                초기화
              </Button>
              <Button
                type="submit"
                disabled={createCharacterMutation.isPending}
                className="min-w-20"
              >
                {createCharacterMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    생성하기
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
