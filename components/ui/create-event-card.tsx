import Link from "next/link";
import { FaPlus } from "react-icons/fa";

export function CreateEventCard({ imageUrl }: { imageUrl: string }) {
  return (
    <Link href="/event-creation" className="block">
      <div className="relative overflow-hidden rounded-3xl mb-8 w-full h-40">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20" />

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Create your own MATCH
            </h2>
          </div>

          {/* Plus button */}
          <div className="self-end">
            <div className="bg-[hsl(81,89%,61%)] rounded-full p-4">
              <FaPlus className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
