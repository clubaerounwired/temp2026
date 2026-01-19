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
        <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover>
          Coming Soon!!
        </FuzzyText>
      </div>
    </div>
  );
}
