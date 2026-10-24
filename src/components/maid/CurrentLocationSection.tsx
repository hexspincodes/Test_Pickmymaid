import MapPin from "../icons/MapPin";

export default function CurrentLocationSection({ location }: { location: string }) {
  return (
    <div className="bg-white rounded-3xl p-6">
      <h2 className="text-base font-semibold text-dark mb-5 flex items-center gap-2">
        Current Location
      </h2>
      <div className="rounded-2xl p-4 bg-primary-50 flex items-center gap-3">
        <div className="w-11 h-11 shrink-0 rounded-full bg-white flex items-center justify-center">
          <MapPin />
        </div>
        <div className="min-w-0">
          <h6 className="text-sm text-[#6F6F6F]">Currently living in</h6>
          <p className="text-base lg:text-lg text-primary font-semibold capitalize truncate">
            {location}
          </p>
        </div>
      </div>
    </div>
  );
}
