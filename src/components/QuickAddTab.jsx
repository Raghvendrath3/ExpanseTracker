import React from "react";
import '../Css/QuickAddTab.css';

const QuickAddTab = ({
  buttonName,
  setButtonName,
  buttonAmount,
  setButtonAmount,
  addCustomButton,
  customButtons,
  deleteCustomButton,
  addExpense,
}) => {
  return (
    <div className="quick-add-tab">
      <div className="create-quick-button">
        <h2>Create Custom Button</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="Button Name (e.g., Tea)"
            value={buttonName}
            onChange={(e) => setButtonName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount (e.g., 5)"
            value={buttonAmount}
            onChange={(e) => setButtonAmount(e.target.value)}
          />
          <button className="primary-button" onClick={addCustomButton}>
            Create
          </button>
        </div>
      </div>
      <div className="quick-buttons-list">
        <h2>Your Quick Add Buttons</h2>
        <div className="quick-buttons-grid">
          {customButtons.map((button, index) => (
            <div className="quick-button-item" key={index}>
              <button
                className="quick-add-button"
                onClick={() => addExpense(button.name, button.amount)}
              >
                {button.name} - ₹{button.amount}
              </button>
              <button
                className="icon-button delete"
                onClick={() => deleteCustomButton(index)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
        {customButtons.length === 0 && (
          <div className="empty-state">
            <p>No custom buttons created yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickAddTab;
