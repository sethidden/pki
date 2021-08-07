import { useMouseInElement, useMousePressed } from "@vueuse/core";
import { computed, Ref, watch } from "vue";

export const useDragAndDrop = (dragged: Ref<unknown>, target: Ref<unknown>, onDroppedInside?: () => void) => {
  const {x, y, isOutside} = useMouseInElement(target);
  const { pressed } = useMousePressed({ target: dragged })
  const dragPosition = computed(() => pressed.value ? { left: `${x.value}px`, top: `${y.value}px`, position: 'absolute' } : null)
  watch(pressed, (newValue) => {
    const releasedInsideElement = !newValue && !isOutside.value;
    if(releasedInsideElement && typeof onDroppedInside === 'function') {
      onDroppedInside();
    }
  })
  return {dragPosition}

}
