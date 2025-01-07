import { Link } from "react-router-dom";

interface Competition {
  ijsId: string;
  year: string;
  name: string;
  startDate: string;
  endDate: string;
  timezone: string;
  venue: string;
  city: string;
  state: string;
}

export function CompetitionList({
  competitions,
}: {
  competitions: Competition[];
}) {
  return (
    <div className="space-y-4">
      {competitions.map((competition) => (
        <div
          key={`${competition.year}-${competition.ijsId}`}
          className="bg-white shadow rounded-lg p-6"
        >
          <Link
            to={`/competition/${competition.year}/${competition.ijsId}`}
            className="hover:text-blue-600"
          >
            <h2 className="text-xl font-bold mb-2">{competition.name}</h2>
            <div className="text-gray-600">
              <p>
                {new Date(competition.startDate).toLocaleDateString()} -{" "}
                {new Date(competition.endDate).toLocaleDateString()} (
                {competition.timezone})
              </p>
              <p>
                {competition.venue}, {competition.city}, {competition.state}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
