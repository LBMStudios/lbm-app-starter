import { MobileController } from "@/components/remote/mobile-controller";

export const metadata = {
  title: "Antigravity Remote Controller | iPhone",
  description: "Control remoto en vivo de tu IDE y proyecto desde el celular.",
};

export default function RemotePage() {
  return <MobileController />;
}
