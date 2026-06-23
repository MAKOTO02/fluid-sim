export type StateMachineListener<TState extends string> = (
  state: TState,
  previousState: TState
) => void;

export type StateTransitionMap<TState extends string> = Partial<
  Record<TState, readonly TState[]>
>;

export class StateMachine<TState extends string> {
  private readonly listeners = new Set<StateMachineListener<TState>>();
  private readonly transitions?: StateTransitionMap<TState>;
  private state: TState;

  constructor(initialState: TState, transitions?: StateTransitionMap<TState>) {
    this.state = initialState;
    this.transitions = transitions;
  }

  getState() {
    return this.state;
  }

  transitionTo(nextState: TState) {
    if (this.state === nextState) return false;
    if (!this.canTransitionTo(nextState)) return false;

    const previousState = this.state;
    this.state = nextState;
    for (const listener of this.listeners) {
      listener(nextState, previousState);
    }
    return true;
  }

  canTransitionTo(nextState: TState) {
    if (!this.transitions) return true;

    const allowedStates = this.transitions[this.state];
    return allowedStates?.includes(nextState) ?? false;
  }

  onChanged(listener: StateMachineListener<TState>) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
