import { useParams } from "react-router-dom";

export function Competition() {
  const { year, ijsId } = useParams<{ year: string; ijsId: string }>();

  // ... rest of the component code using year/ijsId for fetching
}
