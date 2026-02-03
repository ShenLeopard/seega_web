import api from "../api/api";
import * as Models from "../models/gameModels";

export async function ExecutePlayerMove(input: Models.PlayerMoveRequest): Promise<Models.MoveResponse> {
    return await api.post<Models.MoveResponse>("/player-move", input);
}

export async function ExecuteAiMove(input: Models.AiMoveRequest): Promise<Models.MoveResponse> {
    return await api.post<Models.MoveResponse>("/ai-move", input);
}