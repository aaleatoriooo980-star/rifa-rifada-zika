import { toPng } from "html-to-image";
import { toast } from "sonner";

export async function nodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function shareOnWhatsApp(text: string, dataUrl?: string) {
  if (dataUrl && (navigator as any).share && (navigator as any).canShare) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "resultado.png", { type: "image/png" });
      if ((navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({ files: [file], text });
        return;
      }
    } catch {}
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

export async function shareOnInstagram(dataUrl: string) {
  downloadDataUrl(dataUrl, "rifa-resultado.png");
  toast.success("Imagem salva! Abra o Instagram para postar nos Stories.");
}
