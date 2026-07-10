import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

import { logout } from "../services/auth";
import { createPreceptor, deletePreceptor, listPreceptors } from "../services/preceptor";
import { listRollcalls } from "../services/rollcalls";
import { createUBS, deleteUBS, listUBS } from "../services/ubs";
import { HeaderBrand, HeaderLogout } from "../ui/AppHeader";
import { AppModal } from "../ui/AppModal";
import { Button } from "../ui/Button";
import { SearchBox } from "../ui/SearchBox";
import { TurnoTag } from "../ui/TurnoTag";
import { EmptyState } from "../ui/EmptyState";
import { Field } from "../ui/Field";
import { IconButton } from "../ui/IconButton";
import { ScreenContainer } from "../ui/ScreenContainer";
import { Skeleton } from "../ui/Skeleton";
import { confirmAction, notify } from "../ui/feedback";
import { colors, radius, shadow, spacing, type } from "../ui/theme";
import { formatDateBR, normalizeSearch, shiftLabel, todayISO } from "../utils/format";

interface ManagementScreenProps {
    title: string;
}

type Period = "today" | "week" | "all";

const PERIODS: { key: Period; label: string }[] = [
    { key: "today", label: "Hoje" },
    { key: "week", label: "Últimos 7 dias" },
    { key: "all", label: "Todas" },
];

/** Tela de gestão usada pelo coordenador (/coordinator/list) e pelo admin (/admin). */
export function ManagementScreen({ title }: ManagementScreenProps) {
    const { width } = useWindowDimensions();
    const isWide = width >= 900;

    const [rollcalls, setRollcalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [query, setQuery] = useState("");
    const [period, setPeriod] = useState<Period>("today");

    // Busca ignora o período (procura no histórico todo); sem busca, vale o filtro.
    const filteredRollcalls = useMemo(() => {
        const q = normalizeSearch(query.trim());
        if (q) {
            return rollcalls.filter(
                (r) =>
                    normalizeSearch(r.ubsName).includes(q) ||
                    formatDateBR(r.date).includes(q) ||
                    normalizeSearch(shiftLabel(r.shift)).includes(q) ||
                    normalizeSearch(shiftLabel(r.turno || "")).includes(q)
            );
        }
        if (period === "today") {
            const today = todayISO();
            return rollcalls.filter((r) => String(r.date) === today);
        }
        if (period === "week") {
            const limit = new Date();
            limit.setDate(limit.getDate() - 7);
            const yyyy = limit.getFullYear();
            const mm = String(limit.getMonth() + 1).padStart(2, "0");
            const dd = String(limit.getDate()).padStart(2, "0");
            const limitISO = `${yyyy}-${mm}-${dd}`;
            return rollcalls.filter((r) => String(r.date) >= limitISO);
        }
        return rollcalls;
    }, [rollcalls, query, period]);

    // Agrupa chamadas da mesma UBS, mesmo dia e mesmo turno (1ª e 2ª aula juntas).
    // Turnos diferentes (manhã/tarde) geram cards separados.
    const groupedRollcalls = useMemo(() => {
        const aulaOrder = (s: string) =>
            String(s || "").toLowerCase() === "aula2" || String(s || "").toLowerCase() === "tarde"
                ? 2
                : 1;
        // Chamadas antigas não têm o campo turno: usa o shift legado (manha/tarde)
        const turnoOf = (r: any) => {
            if (r.turno) return String(r.turno).toLowerCase();
            const s = String(r.shift || "").toLowerCase();
            return s === "manha" || s === "tarde" ? s : "";
        };
        const map = new Map<string, any>();
        for (const r of filteredRollcalls) {
            const turno = turnoOf(r);
            const key = `${normalizeSearch(r.ubsSlug || r.ubsName || "")}|${r.date}|${turno}`;
            if (!map.has(key)) {
                map.set(key, { key, ubsName: r.ubsName, date: r.date, turno, items: [] });
            }
            map.get(key).items.push(r);
        }
        const groups = Array.from(map.values());
        for (const g of groups) {
            g.items.sort((a: any, b: any) => aulaOrder(a.shift) - aulaOrder(b.shift));
        }
        groups.sort((a, b) =>
            a.date === b.date
                ? String(a.ubsName).localeCompare(String(b.ubsName))
                : String(a.date) < String(b.date)
                  ? 1
                  : -1
        );
        return groups;
    }, [filteredRollcalls]);

    const [ubsList, setUbsList] = useState<any[]>([]);
    const [ubsModal, setUbsModal] = useState(false);
    const [ubsName, setUbsName] = useState("");
    const [ubsError, setUbsError] = useState<string | null>(null);
    const [ubsSaving, setUbsSaving] = useState(false);
    const [ubsQuery, setUbsQuery] = useState("");

    const [preceptors, setPreceptors] = useState<any[]>([]);
    const [precModal, setPrecModal] = useState(false);
    const [precName, setPrecName] = useState("");
    const [precEmail, setPrecEmail] = useState("");
    const [precPass, setPrecPass] = useState("");
    const [precError, setPrecError] = useState<string | null>(null);
    const [precSaving, setPrecSaving] = useState(false);
    const [precQuery, setPrecQuery] = useState("");

    const filteredUbs = useMemo(() => {
        const q = normalizeSearch(ubsQuery.trim());
        if (!q) return ubsList;
        return ubsList.filter((u) => normalizeSearch(u.name).includes(q));
    }, [ubsList, ubsQuery]);

    const filteredPreceptors = useMemo(() => {
        const q = normalizeSearch(precQuery.trim());
        if (!q) return preceptors;
        return preceptors.filter(
            (p) => normalizeSearch(p.name).includes(q) || normalizeSearch(p.email).includes(q)
        );
    }, [preceptors, precQuery]);

    async function loadAll(asRefresh = false) {
        if (asRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const [calls, u, p] = await Promise.all([listRollcalls(), listUBS(), listPreceptors()]);
            setRollcalls(calls);
            setUbsList(u);
            setPreceptors(p);
        } catch (e: any) {
            notify("error", e?.message || "Falha ao carregar os dados.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    async function handleLogout() {
        await logout();
        router.replace("/login");
    }

    async function handleCreateUbs() {
        const name = ubsName.trim();
        if (!name) {
            setUbsError("Informe o nome da UBS.");
            return;
        }
        try {
            setUbsSaving(true);
            await createUBS(name);
            setUbsName("");
            setUbsError(null);
            notify("success", "UBS cadastrada.");
            await loadAll();
        } catch (e: any) {
            notify("error", e?.message || "Falha ao cadastrar a UBS.");
        } finally {
            setUbsSaving(false);
        }
    }

    async function handleDeleteUbs(id: string, name: string) {
        const ok = await confirmAction({
            title: "Excluir UBS",
            message: `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`,
            confirmLabel: "Excluir",
            destructive: true,
        });
        if (!ok) return;
        try {
            await deleteUBS(id);
            notify("success", "UBS excluída.");
            await loadAll();
        } catch (e: any) {
            notify("error", e?.message || "Falha ao excluir a UBS.");
        }
    }

    async function handleCreatePreceptor() {
        const name = precName.trim();
        const email = precEmail.trim().toLowerCase();
        const password = precPass.trim();

        if (!name || !email || !password) {
            setPrecError("Informe nome, e-mail e senha.");
            return;
        }
        if (password.length < 6) {
            setPrecError("A senha precisa ter pelo menos 6 caracteres.");
            return;
        }

        try {
            setPrecSaving(true);
            await createPreceptor({ name, email, password });
            setPrecName("");
            setPrecEmail("");
            setPrecPass("");
            setPrecError(null);
            notify("success", "Preceptor criado com acesso ao app.");
            await loadAll();
        } catch (e: any) {
            notify("error", e?.message || "Falha ao criar o preceptor.");
        } finally {
            setPrecSaving(false);
        }
    }

    async function handleDeletePreceptor(id: string, name: string) {
        const ok = await confirmAction({
            title: "Excluir preceptor",
            message: `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`,
            confirmLabel: "Excluir",
            destructive: true,
        });
        if (!ok) return;
        try {
            await deletePreceptor(id);
            notify("success", "Preceptor excluído.");
            await loadAll();
        } catch (e: any) {
            notify("error", e?.message || "Falha ao excluir o preceptor.");
        }
    }

    return (
        <ScreenContainer scrollable={false}>
            <Stack.Screen
                options={{
                    title,
                    headerTitle: () => <HeaderBrand label={title} />,
                    headerRight: () => <HeaderLogout onPress={handleLogout} />,
                }}
            />

            <View style={[styles.container, isWide && styles.containerWide]}>
                <View style={styles.actions}>
                    <Button
                        title="Cadastrar UBS"
                        icon="business-outline"
                        variant="secondary"
                        small
                        onPress={() => {
                            setUbsQuery("");
                            setUbsModal(true);
                        }}
                    />
                    <Button
                        title="Cadastrar preceptor"
                        icon="person-add-outline"
                        variant="secondary"
                        small
                        onPress={() => {
                            setPrecQuery("");
                            setPrecModal(true);
                        }}
                    />
                    <Button
                        title="Atualizar"
                        icon="refresh-outline"
                        variant="plain"
                        small
                        loading={loading && !refreshing}
                        onPress={() => loadAll()}
                    />
                </View>

                <Text style={styles.sectionTitle}>Chamadas recebidas</Text>

                {/* Barra de pesquisa */}
                <SearchBox
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Buscar por UBS, data ou turno..."
                    style={styles.search}
                />

                {/* Filtro de período (some durante a busca, que vale para o histórico todo) */}
                {query.trim().length === 0 ? (
                    <View style={styles.filterRow}>
                        {PERIODS.map((p) => {
                            const active = period === p.key;
                            return (
                                <Pressable
                                    key={p.key}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                    onPress={() => setPeriod(p.key)}
                                    style={({ pressed }) => [
                                        styles.chip,
                                        active && styles.chipActive,
                                        pressed && !active && styles.chipPressed,
                                    ]}
                                >
                                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                        {p.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                ) : (
                    <Text style={styles.resultCount}>
                        {filteredRollcalls.length}{" "}
                        {filteredRollcalls.length === 1 ? "resultado" : "resultados"} no histórico
                    </Text>
                )}

                {loading ? (
                    <View style={styles.skeletons}>
                        {[0, 1, 2].map((i) => (
                            <View key={i} style={styles.skeletonCard}>
                                <Skeleton height={16} width="45%" />
                                <Skeleton height={12} width="65%" style={{ marginTop: spacing.sm }} />
                            </View>
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={groupedRollcalls}
                        keyExtractor={(g) => g.key}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} />
                        }
                        renderItem={({ item: group }) => (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Abrir chamadas de ${group.ubsName} em ${formatDateBR(group.date)}`}
                                onPress={() =>
                                    group.items.length === 1
                                        ? router.push(`/coordinator/${group.items[0].id}`)
                                        : router.push({
                                              pathname: "/coordinator/group",
                                              params: {
                                                  ids: group.items.map((i: any) => i.id).join(","),
                                              },
                                          })
                                }
                                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                            >
                                <View style={styles.cardBody}>
                                    {group.turno ? (
                                        <TurnoTag turno={group.turno} style={styles.turnoTag} />
                                    ) : null}
                                    <Text style={styles.cardTitle}>{group.ubsName}</Text>
                                    <View style={styles.cardMetaRow}>
                                        <Ionicons name="calendar-outline" size={14} color={colors.muted} />
                                        <Text style={styles.cardMeta}>{formatDateBR(group.date)}</Text>
                                        {group.items.map((it: any) => (
                                            <View key={it.id} style={styles.badge}>
                                                <Text style={styles.badgeText}>
                                                    {shiftLabel(it.shift)} · {(it.ras || []).length} RA
                                                    {(it.ras || []).length === 1 ? "" : "s"}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                            </Pressable>
                        )}
                        ListEmptyComponent={
                            query.trim().length > 0 ? (
                                <EmptyState
                                    icon="search-outline"
                                    title="Nada encontrado"
                                    description={`Nenhuma chamada corresponde a "${query.trim()}".`}
                                />
                            ) : period !== "all" ? (
                                <EmptyState
                                    icon="today-outline"
                                    title={
                                        period === "today"
                                            ? "Nenhuma chamada hoje"
                                            : "Nenhuma chamada nos últimos 7 dias"
                                    }
                                    description="As chamadas aparecem aqui assim que os preceptores salvarem."
                                >
                                    <Button
                                        title="Ver todas as chamadas"
                                        variant="secondary"
                                        small
                                        onPress={() => setPeriod("all")}
                                    />
                                </EmptyState>
                            ) : (
                                <EmptyState
                                    icon="clipboard-outline"
                                    title="Nenhuma chamada recebida"
                                    description="As chamadas salvas pelos preceptores aparecem aqui."
                                />
                            )
                        }
                    />
                )}

                {/* MODAL UBS */}
                <AppModal
                    visible={ubsModal}
                    onClose={() => setUbsModal(false)}
                    title="Cadastrar UBS"
                    footer={
                        <>
                            <Button title="Fechar" variant="plain" onPress={() => setUbsModal(false)} />
                            <Button title="Salvar" loading={ubsSaving} onPress={handleCreateUbs} />
                        </>
                    }
                >
                    <Field
                        label="Nome da UBS"
                        placeholder="Ex.: UBS Central"
                        value={ubsName}
                        error={ubsError}
                        onChangeText={(v) => {
                            setUbsName(v);
                            if (ubsError) setUbsError(null);
                        }}
                        onSubmitEditing={handleCreateUbs}
                    />

                    <Text style={styles.modalSubtitle}>
                        UBS cadastradas ({ubsList.length})
                    </Text>
                    {ubsList.length > 0 && (
                        <SearchBox
                            value={ubsQuery}
                            onChangeText={setUbsQuery}
                            placeholder="Buscar UBS..."
                            style={styles.modalSearch}
                        />
                    )}
                    <ScrollView style={styles.modalList} nestedScrollEnabled>
                        {ubsList.length === 0 ? (
                            <Text style={styles.modalEmpty}>Nenhuma UBS cadastrada.</Text>
                        ) : filteredUbs.length === 0 ? (
                            <Text style={styles.modalEmpty}>
                                Nenhuma UBS encontrada para “{ubsQuery.trim()}”.
                            </Text>
                        ) : (
                            filteredUbs.map((item, index) => (
                                <View
                                    key={item.id}
                                    style={[styles.row, index === filteredUbs.length - 1 && styles.rowLast]}
                                >
                                    <Text style={styles.rowText}>{item.name}</Text>
                                    <IconButton
                                        icon="trash-outline"
                                        label={`Excluir UBS ${item.name}`}
                                        color={colors.danger}
                                        onPress={() => handleDeleteUbs(item.id, item.name)}
                                    />
                                </View>
                            ))
                        )}
                    </ScrollView>
                </AppModal>

                {/* MODAL PRECEPTOR */}
                <AppModal
                    visible={precModal}
                    onClose={() => setPrecModal(false)}
                    title="Cadastrar preceptor"
                    footer={
                        <>
                            <Button title="Fechar" variant="plain" onPress={() => setPrecModal(false)} />
                            <Button title="Salvar" loading={precSaving} onPress={handleCreatePreceptor} />
                        </>
                    }
                >
                    <Field
                        label="Nome"
                        placeholder="Nome completo"
                        value={precName}
                        onChangeText={(v) => {
                            setPrecName(v);
                            if (precError) setPrecError(null);
                        }}
                        containerStyle={styles.fieldGap}
                    />
                    <Field
                        label="E-mail"
                        placeholder="email@exemplo.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={precEmail}
                        onChangeText={(v) => {
                            setPrecEmail(v);
                            if (precError) setPrecError(null);
                        }}
                        containerStyle={styles.fieldGap}
                    />
                    <Field
                        label="Senha"
                        placeholder="Mínimo de 6 caracteres"
                        secureTextEntry
                        value={precPass}
                        error={precError}
                        onChangeText={(v) => {
                            setPrecPass(v);
                            if (precError) setPrecError(null);
                        }}
                        containerStyle={styles.fieldGap}
                    />

                    <Text style={styles.modalSubtitle}>
                        Preceptores cadastrados ({preceptors.length})
                    </Text>
                    {preceptors.length > 0 && (
                        <SearchBox
                            value={precQuery}
                            onChangeText={setPrecQuery}
                            placeholder="Buscar por nome ou e-mail..."
                            style={styles.modalSearch}
                        />
                    )}
                    <ScrollView style={styles.modalList} nestedScrollEnabled>
                        {preceptors.length === 0 ? (
                            <Text style={styles.modalEmpty}>Nenhum preceptor cadastrado.</Text>
                        ) : filteredPreceptors.length === 0 ? (
                            <Text style={styles.modalEmpty}>
                                Nenhum preceptor encontrado para “{precQuery.trim()}”.
                            </Text>
                        ) : (
                            filteredPreceptors.map((item, index) => (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.row,
                                        index === filteredPreceptors.length - 1 && styles.rowLast,
                                    ]}
                                >
                                    <View style={styles.rowInfo}>
                                        <Text style={styles.rowText}>{item.name}</Text>
                                        <Text style={styles.rowSub}>{item.email}</Text>
                                    </View>
                                    <IconButton
                                        icon="trash-outline"
                                        label={`Excluir preceptor ${item.name}`}
                                        color={colors.danger}
                                        onPress={() => handleDeletePreceptor(item.id, item.name)}
                                    />
                                </View>
                            ))
                        )}
                    </ScrollView>
                </AppModal>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    containerWide: { maxWidth: 1000, alignSelf: "center", width: "100%" },

    actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },

    sectionTitle: {
        ...type.sectionTitle,
        marginBottom: spacing.md,
    },

    search: {
        marginBottom: spacing.md,
    },
    modalSearch: {
        marginBottom: spacing.sm,
    },

    filterRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    chip: {
        minHeight: 36,
        justifyContent: "center",
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipPressed: {
        backgroundColor: colors.bg,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.body,
    },
    chipTextActive: {
        color: colors.white,
    },
    resultCount: {
        ...type.meta,
        marginBottom: spacing.md,
    },

    listContent: {
        gap: spacing.sm,
        paddingBottom: spacing.xl,
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
        ...shadow,
    },
    cardPressed: {
        backgroundColor: colors.bg,
    },
    cardBody: { flex: 1 },
    turnoTag: {
        marginBottom: spacing.xs + 2,
    },
    cardTitle: {
        ...type.itemTitle,
    },
    cardMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    cardMeta: {
        ...type.meta,
    },
    badge: {
        backgroundColor: colors.primaryTint,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        marginLeft: spacing.xs,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.primary,
    },

    skeletons: { gap: spacing.sm },
    skeletonCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.lg,
    },

    modalSubtitle: {
        ...type.label,
        marginTop: spacing.xl,
        marginBottom: spacing.sm,
    },
    modalList: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        maxHeight: 260,
    },
    modalEmpty: {
        ...type.meta,
        padding: spacing.lg,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.sm,
        paddingLeft: spacing.lg,
        paddingRight: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    rowInfo: { flex: 1 },
    rowText: {
        ...type.itemTitle,
    },
    rowSub: {
        ...type.meta,
        marginTop: 2,
    },
    fieldGap: {
        marginBottom: spacing.lg,
    },
});
