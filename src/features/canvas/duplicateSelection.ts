import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import { activeBoard } from "@/core/store/helpers";

/**
 * Duplica a seleção com feedback visível. O store ignora elementos bloqueados
 * silenciosamente; aqui explicamos o motivo e confirmamos quando a cópia é criada.
 */
export function duplicateSelection(ids?: string[]): number {
  const state = useAppStore.getState();
  const board = activeBoard(state);
  const selected = ids ?? state.selection;
  if (!board || selected.length === 0) {
    toast.info("Selecione um elemento para duplicar.");
    return 0;
  }

  const unlocked = selected.filter((id) => board.nodes[id] && !board.nodes[id].locked);
  if (unlocked.length === 0) {
    toast.warning("Nenhum elemento pôde ser duplicado", {
      description: "Elementos bloqueados precisam ser desbloqueados pelo inspector ou pelo menu de contexto.",
    });
    return 0;
  }

  const before = Object.keys(board.nodes).length;
  state.duplicateNodes(unlocked);
  const target = activeBoard(useAppStore.getState());
  const count = target ? Object.keys(target.nodes).length - before : 0;
  if (count === 0) {
    toast.error("Não foi possível duplicar a seleção");
    return 0;
  }

  toast.success(count === 1 ? "Elemento duplicado" : `${count} elementos duplicados`, {
    id: "duplicate-selection",
    description: "A cópia está selecionada e deslocada 36 px.",
  });
  return count;
}
