import { goalOptions } from "@/lib/catalog";
import type { GoalKey } from "@/lib/app-types";

type GoalCheckboxesProps = {
  selected?: GoalKey[];
};

export function GoalCheckboxes({
  selected = [],
}: GoalCheckboxesProps) {
  return (
    <div className="checkbox-grid">
      {goalOptions.map((goal) => (
        <label className="checkbox-pill" htmlFor={`goal-${goal.value}`} key={goal.value}>
          <input
            defaultChecked={selected.includes(goal.value)}
            id={`goal-${goal.value}`}
            name="goals"
            type="checkbox"
            value={goal.value}
          />
          <span>{goal.label}</span>
        </label>
      ))}
    </div>
  );
}
