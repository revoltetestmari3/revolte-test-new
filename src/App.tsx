import { useCallback, useEffect, useState } from 'react';

type Operator = '+' | '−' | '×' | '÷';

type ButtonKind = 'number' | 'operator' | 'utility' | 'equals';

type CalculatorButton = {
  label: string;
  kind: ButtonKind;
  action: () => void;
  className?: string;
  ariaLabel?: string;
};

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Can’t divide by zero';
  }

  return Number(value.toPrecision(12)).toLocaleString('en-US', {
    maximumFractionDigits: 10,
    useGrouping: false,
  });
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [expression, setExpression] = useState('');
  const [shouldOverwrite, setShouldOverwrite] = useState(false);

  const clear = useCallback(() => {
    setDisplay('0');
    setStoredValue(null);
    setOperator(null);
    setExpression('');
    setShouldOverwrite(false);
  }, []);

  const inputDigit = useCallback(
    (digit: string) => {
      if (display === 'Can’t divide by zero' || shouldOverwrite) {
        setDisplay(digit);
        setShouldOverwrite(false);
        return;
      }

      setDisplay((current) => (current === '0' ? digit : `${current}${digit}`));
    },
    [display, shouldOverwrite]
  );

  const inputDecimal = useCallback(() => {
    if (display === 'Can’t divide by zero' || shouldOverwrite) {
      setDisplay('0.');
      setShouldOverwrite(false);
      return;
    }

    setDisplay((current) => (current.includes('.') ? current : `${current}.`));
  }, [display, shouldOverwrite]);

  const backspace = useCallback(() => {
    if (display === 'Can’t divide by zero' || shouldOverwrite) {
      clear();
      return;
    }

    setDisplay((current) => (current.length > 1 ? current.slice(0, -1) : '0'));
  }, [clear, display, shouldOverwrite]);

  const calculate = useCallback(
    (left: number, right: number, selectedOperator: Operator): number => {
      switch (selectedOperator) {
        case '+':
          return left + right;
        case '−':
          return left - right;
        case '×':
          return left * right;
        case '÷':
          return right === 0 ? Number.NaN : left / right;
      }
    },
    []
  );

  const chooseOperator = useCallback(
    (nextOperator: Operator) => {
      if (display === 'Can’t divide by zero') {
        clear();
        return;
      }

      const currentValue = Number(display);

      if (storedValue !== null && operator && !shouldOverwrite) {
        const result = calculate(storedValue, currentValue, operator);
        const formattedResult = formatNumber(result);
        setDisplay(formattedResult);
        setStoredValue(Number.isFinite(result) ? result : null);
        setExpression(`${formattedResult} ${nextOperator}`);
      } else {
        setStoredValue(currentValue);
        setExpression(`${display} ${nextOperator}`);
      }

      setOperator(nextOperator);
      setShouldOverwrite(true);
    },
    [calculate, clear, display, operator, shouldOverwrite, storedValue]
  );

  const equals = useCallback(() => {
    if (storedValue === null || operator || display === 'Can’t divide by zero') {
      if (storedValue === null || operator === null) {
        return;
      }
    }

    const result = calculate(storedValue as number, Number(display), operator as Operator);
    const formattedResult = formatNumber(result);
    setExpression(`${formatNumber(storedValue as number)} ${operator} ${display} =`);
    setDisplay(formattedResult);
    setStoredValue(null);
    setOperator(null);
    setShouldOverwrite(true);
  }, [calculate, display, operator, storedValue]);

  const percent = useCallback(() => {
    if (display === 'Can’t divide by zero') {
      return;
    }

    const result = Number(display) / 100;
    setDisplay(formatNumber(result));
    setShouldOverwrite(false);
  }, [display]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key } = event;

      if (/^\d$/.test(key)) {
        inputDigit(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+' || key === '-') {
        chooseOperator(key === '-' ? '−' : '+');
      } else if (key === '*') {
        chooseOperator('×');
      } else if (key === '/') {
        chooseOperator('÷');
      } else if (key === '%') {
        percent();
      } else if (key === 'Enter' || key === '=') {
        equals();
      } else if (key === 'Backspace') {
        backspace();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clear();
      } else {
        return;
      }

      event.preventDefault();
    },
    [backspace, chooseOperator, clear, equals, inputDecimal, inputDigit, percent]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const buttons: CalculatorButton[] = [
    { label: 'C', kind: 'utility', action: clear, ariaLabel: 'Clear calculator' },
    { label: '⌫', kind: 'utility', action: backspace, ariaLabel: 'Backspace' },
    { label: '%', kind: 'utility', action: percent, ariaLabel: 'Percent' },
    { label: '÷', kind: 'operator', action: () => chooseOperator('÷'), ariaLabel: 'Divide' },
    { label: '7', kind: 'number', action: () => inputDigit('7') },
    { label: '8', kind: 'number', action: () => inputDigit('8') },
    { label: '9', kind: 'number', action: () => inputDigit('9') },
    { label: '×', kind: 'operator', action: () => chooseOperator('×'), ariaLabel: 'Multiply' },
    { label: '4', kind: 'number', action: () => inputDigit('4') },
    { label: '5', kind: 'number', action: () => inputDigit('5') },
    { label: '6', kind: 'number', action: () => inputDigit('6') },
    { label: '−', kind: 'operator', action: () => chooseOperator('−'), ariaLabel: 'Subtract' },
    { label: '1', kind: 'number', action: () => inputDigit('1') },
    { label: '2', kind: 'number', action: () => inputDigit('2') },
    { label: '3', kind: 'number', action: () => inputDigit('3') },
    { label: '+', kind: 'operator', action: () => chooseOperator('+'), ariaLabel: 'Add' },
    {
      label: '0',
      kind: 'number',
      action: () => inputDigit('0'),
      className: 'calculator-button--wide',
    },
    { label: '.', kind: 'number', action: inputDecimal, ariaLabel: 'Decimal point' },
    { label: '=', kind: 'equals', action: equals, ariaLabel: 'Equals' },
  ];

  return (
    <main className="calculator-page">
      <section className="calculator-intro" aria-labelledby="calculator-title">
        <p className="eyebrow">A little math, made easy</p>
        <h1 id="calculator-title">Count on it.</h1>
        <p className="intro-copy">
          A calm, friendly calculator for the everyday numbers that keep things moving.
        </p>
      </section>

      <section className="calculator-shell" aria-label="Calculator">
        <div className="calculator-display" aria-live="polite">
          <span className="calculator-expression">{expression || 'Ready when you are'}</span>
          <output className="calculator-value" aria-label="Current calculator value">
            {display}
          </output>
        </div>

        <div className="calculator-keypad">
          {buttons.map(({ label, kind, action, className, ariaLabel }) => (
            <button
              className={`calculator-button calculator-button--${kind} ${className ?? ''}`}
              key={label}
              onClick={action}
              type="button"
              aria-label={ariaLabel ?? label}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <p className="keyboard-hint">
        <span aria-hidden="true">⌘</span> Use your keyboard, too
      </p>
    </main>
  );
}
