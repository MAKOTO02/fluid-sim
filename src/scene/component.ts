import type{ GameObject } from "./gameObject";

export interface Component{
    enabled: boolean;
    owner?: GameObject;
    start?(): void;
    update?(dt: number): void;
    onAttach?(): void;
    onDetach?(): void;
    onEnable?(): void;
    onDisable?(): void;
}