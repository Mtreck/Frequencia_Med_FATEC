import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Preferências locais do usuário (no web usa localStorage por baixo).
 * Falhas de armazenamento nunca devem quebrar o fluxo — por isso os try/catch.
 */

const LAST_UBS_KEY = "preceptor.lastUbsId";

export async function getLastUbsId(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(LAST_UBS_KEY);
    } catch {
        return null;
    }
}

export async function setLastUbsId(id: string): Promise<void> {
    try {
        await AsyncStorage.setItem(LAST_UBS_KEY, id);
    } catch {
        // sem armazenamento disponível — segue sem persistir
    }
}
