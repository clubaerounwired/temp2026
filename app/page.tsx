import DotGrid from "./DotGrid";
import "./globals.css";
import FuzzyText from "./FuzzyText";
export default function Page() {
  return (
    <div className="relative flex items-center justify-center h-screen w-screen bg-black overflow-hidden">
      <div style={{ width: "100%", height: "100vh" }}>
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#271E37"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      <div className="absolute">
        <FuzzyText
          color="#A78BFA"
          baseIntensity={0.13}
          hoverIntensity={0.5}
          enableHover
          className="w-full h-[15vh]"
          fontSize="clamp(6rem, 6vw, 20rem)"
        >
          SYSTEMS CHECK: IN PROGRESS
        </FuzzyText>
      </div>
    </div>
  );
}
