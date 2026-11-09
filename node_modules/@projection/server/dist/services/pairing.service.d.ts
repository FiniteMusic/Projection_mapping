import { type CreatePairingResponse } from "@projection/shared";
import type { PairingStatusResponse, PairSessionResponse } from "@projection/shared";
export declare function createPlayerPairing(): Promise<CreatePairingResponse>;
export declare function getPlayerPairingStatus(pairingToken: string): Promise<PairingStatusResponse>;
export declare function confirmPlayerPairing(pairingCode: string, projectId: string, userId: string): Promise<PairSessionResponse>;
