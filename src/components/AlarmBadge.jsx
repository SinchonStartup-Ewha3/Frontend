import outerIcon from "../assets/icons/alarm-outer.svg";
import exerciseIcon from "../assets/icons/alarm-exercise.svg";
import laundryIcon from "../assets/icons/alarm-laundry.svg";
import umbrellaIcon from "../assets/icons/alarm-umbrella.svg";

const ICONS = {
  outer: outerIcon,
  exercise: exerciseIcon,
  laundry: laundryIcon,
  umbrella: umbrellaIcon,
};

const AlarmBadge = ({ type, size = 41, className = "" }) => (
  <span
    aria-hidden="true"
    className={`flex shrink-0 items-center justify-center rounded-full bg-sub ${className}`}
    style={{ width: size, height: size }}
  >
    <img
      src={ICONS[type]}
      alt=""
      style={{ width: size * 0.49, height: size * 0.49 }}
    />
  </span>
);

export default AlarmBadge;
