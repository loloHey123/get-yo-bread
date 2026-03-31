import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="space-y-8 max-w-md">
        <div className="w-24 h-24 mx-auto">
          <Image
            src="/placeholder-bread.svg"
            alt="Get Yo Bread"
            width={96}
            height={96}
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-bold" style={{ color: "#8B4513" }}>
            Get Yo Bread
          </h1>
          <p className="text-xl" style={{ color: "#F4A460" }}>
            Tap in. Earn your dough. Treat yourself.
          </p>
        </div>

        <div style={{ color: "rgba(62, 39, 35, 0.7)" }}>
          <p>
            Tap your NFC bread to clock in. Watch your dough rise.
            Every Friday, get a bakery treat recommendation near you.
          </p>
        </div>

        <p className="text-sm" style={{ color: "rgba(62, 39, 35, 0.4)" }}>
          Tap your bread to get started.
        </p>
      </div>
    </main>
  );
}
