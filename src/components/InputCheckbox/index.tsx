import classNames from "classnames"
import { useRef } from "react"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)

  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
      <label
        // Bug 2 Fix: Needed to associate the label with the checkbox input
        htmlFor={inputId}
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
          "RampInputCheckbox--label-disabled": disabled,
        })}
      />
      <input
        id={inputId}
        type="checkbox"
        style={{ height: "40px" }}
        className="RampInputCheckbox--input"
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          console.log("checkbox for " + inputId + " toggled to " + event.target.checked)
          onChange(event.target.checked)
        }}
      />
    </div>
  )
}
