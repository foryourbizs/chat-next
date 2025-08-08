"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useCharacters,
  useChatStore,
  useSelectedCharacter,
} from "@/store/chat";
import { User } from "lucide-react";
import { CharacterCreateDialog } from "./character-create-dialog";

interface CharacterSelectorProps {
  onCreateCharacter?: () => void;
  className?: string;
}

export function CharacterSelector({
  onCreateCharacter,
  className,
}: CharacterSelectorProps) {
  const characters = useCharacters();
  const selectedCharacter = useSelectedCharacter();
  const { setSelectedCharacter } = useChatStore();

  const handleCharacterChange = (characterId: string) => {
    const character = characters.find((c) => c.id.toString() === characterId);
    setSelectedCharacter(character || null);
  };

  // 캐릭터가 없는 경우
  if (characters.length === 0) {
    return (
      <div className={cn("p-4 space-y-3", className)}>
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-sm">캐릭터가 없습니다</h3>
            <p className="text-xs text-muted-foreground">
              새 캐릭터를 생성하여 대화를 시작하세요.
            </p>
          </div>
          <CharacterCreateDialog onCharacterCreated={onCreateCharacter} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* 캐릭터 선택 드롭다운 */}
      <div className="space-y-2 w-full">
        <Select
          value={selectedCharacter?.id.toString() || ""}
          onValueChange={handleCharacterChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="캐릭터를 선택하세요">
              {selectedCharacter && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {selectedCharacter.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedCharacter.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {characters.map((character) => (
              <SelectItem key={character.id} value={character.id.toString()}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {character.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{character.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-40">
                      {character.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 선택된 캐릭터 정보 */}
      {selectedCharacter && (
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {selectedCharacter.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{selectedCharacter.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {selectedCharacter.description}
              </p>
            </div>
          </div>

          {/* 시스템 프롬프트 미리보기 */}
          {selectedCharacter.systemPrompt && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  시스템 프롬프트
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {selectedCharacter.systemPrompt}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 새 캐릭터 생성 다이얼로그 */}
      <CharacterCreateDialog onCharacterCreated={onCreateCharacter} />
    </div>
  );
}
