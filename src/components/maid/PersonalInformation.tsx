import { ReactNode } from "react";

interface PersonalInformationProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

const Info = ({ item }: { item: PersonalInformationProps }) => {
  return (
    <div key={item.label} className="flex items-center gap-2.5 sm:gap-3">
      <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full bg-[#F5F5F5] backdrop-blur-sm flex items-center justify-center text-white">
        {item.icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs leading-none mb-1">{item.label}</p>
        <p className="text-sm sm:text-base capitalize font-semibold leading-tight wrap-break-word">
          {item.value}
        </p>
      </div>
    </div>
  );
};

export default function PersonalInformation({
  info,
}: {
  info: PersonalInformationProps[];
}) {
  return (
    <div className="bg-white rounded-3xl p-6">
      <h2 className="text-base font-semibold text-dark mb-5 flex items-center gap-2">
        Personal Information
      </h2>

      {/* One column on the narrowest phones and 3 while the sidebar is narrow
          (lg), so values like "Negotiable" are never broken mid-word */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-5 sm:gap-y-6">
        {info.map((item) => (
          <Info item={item} key={item.label} />
        ))}
      </div>
    </div>
  );
}
