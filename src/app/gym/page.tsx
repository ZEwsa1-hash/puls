"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Col,
  Empty,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CopyOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import AppLayout from "@/components/AppLayout";
import {
  calculateOneRepMax,
  calculatePercentage,
  calculateTonnage,
  ExerciseRecord,
  GymSession,
  SetRecord,
  useGymStore,
} from "@/store/useGymStore";

const { Title, Text } = Typography;

type WorkoutTemplate = "push" | "pull" | "legs" | "fullBody" | "upperBody" | "lowerBody" | "custom";
type SessionFilter = "all" | "push" | "pull" | "legs" | "fullBody";
type MuscleGroup = "chest" | "back" | "shoulders" | "arms" | "legs" | "glutes" | "core";

type SessionFormState = {
  id?: string;
  title: string;
  date: string;
  exercises: ExerciseRecord[];
};

type ExerciseStat = {
  name: string;
  tonnage: number;
  sets: number;
  reps: number;
  bestOneRepMax: number;
  bestWeight: number;
};

type SetTableRow = SetRecord & {
  setNumber: number;
};

const todayIso = () => new Date().toISOString().split("T")[0];

const toDateKey = (date: Date) => date.toISOString().split("T")[0];

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const createSet = (): SetRecord => ({
  id: `set-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  weight: 0,
  reps: 0,
});

const createExercise = (name = ""): ExerciseRecord => ({
  id: `exercise-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name,
  sets: [createSet(), createSet(), createSet()],
});

const templateExercises: Record<WorkoutTemplate, string[]> = {
  push: ["Жим лежа", "Жим гантелей под углом", "Жим сидя", "Разгибание на трицепс"],
  pull: ["Подтягивания", "Тяга штанги", "Тяга верхнего блока", "Сгибание на бицепс"],
  legs: ["Приседания", "Румынская тяга", "Жим ногами", "Сгибание ног"],
  fullBody: ["Приседания", "Жим лежа", "Тяга штанги", "Жим стоя"],
  upperBody: ["Жим лежа", "Тяга верхнего блока", "Жим сидя", "Тяга штанги", "Разгибание на трицепс"],
  lowerBody: ["Приседания", "Румынская тяга", "Жим ногами", "Сгибание ног", "Подъемы на икры"],
  custom: [""],
};

const templateTitles: Record<WorkoutTemplate, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  fullBody: "Full body",
  upperBody: "Upper body",
  lowerBody: "Lower body",
  custom: "",
};

const filterLabels: Record<SessionFilter, string> = {
  all: "Все",
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  fullBody: "Full body",
};

const plannedWeek: Array<{ day: string; title: string; template: WorkoutTemplate; accent: string }> = [
  { day: "Сб", title: "Upper body", template: "upperBody", accent: "var(--cyan)" },
  { day: "Вс", title: "Lower body", template: "lowerBody", accent: "var(--acid)" },
  { day: "Ср", title: "Upper body", template: "upperBody", accent: "var(--coral)" },
  { day: "Чт", title: "Lower body", template: "lowerBody", accent: "var(--amber)" },
];

const muscleLabels: Record<MuscleGroup, string> = {
  chest: "Грудь",
  back: "Спина",
  shoulders: "Плечи",
  arms: "Руки",
  legs: "Квадрицепс",
  glutes: "Задняя цепь",
  core: "Кор",
};

const muscleColors: Record<MuscleGroup, string> = {
  chest: "#ff6b5f",
  back: "#35c3ff",
  shoulders: "#f6c344",
  arms: "#d7ff45",
  legs: "#9b7cff",
  glutes: "#ff8f3d",
  core: "#ffffff",
};

const emptyForm = (): SessionFormState => ({
  title: "",
  date: todayIso(),
  exercises: [],
});

const cloneSession = (session: GymSession): SessionFormState => ({
  id: session.id,
  title: session.title,
  date: session.date,
  exercises: session.exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => ({ ...set })),
  })),
});

const formatKg = (value: number) => `${value.toLocaleString("ru-RU")} кг`;

const cloneExercisesForNewSession = (exercises: ExerciseRecord[]) =>
  exercises.map((exercise) => ({
    ...exercise,
    id: `exercise-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sets: exercise.sets.map((set) => ({
      ...set,
      id: `set-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    })),
  }));

const getSessionType = (title: string): Exclude<SessionFilter, "all"> | "other" => {
  const normalized = title.toLowerCase();
  if (normalized.includes("push")) return "push";
  if (normalized.includes("pull")) return "pull";
  if (normalized.includes("leg") || normalized.includes("lower")) return "legs";
  if (normalized.includes("full") || normalized.includes("upper")) return "fullBody";
  return "other";
};

const getExerciseMuscles = (name: string): MuscleGroup[] => {
  const normalized = name.toLowerCase();

  if (normalized.includes("жим леж") || normalized.includes("груд")) return ["chest", "shoulders", "arms"];
  if (normalized.includes("жим сид") || normalized.includes("жим сто") || normalized.includes("плеч")) return ["shoulders", "arms"];
  if (normalized.includes("тяга") || normalized.includes("подтяг")) return ["back", "arms"];
  if (normalized.includes("бицеп") || normalized.includes("трицеп") || normalized.includes("разгиб")) return ["arms"];
  if (normalized.includes("присед") || normalized.includes("жим ног") || normalized.includes("сгибание ног")) return ["legs", "glutes"];
  if (normalized.includes("румын") || normalized.includes("икр")) return ["glutes", "legs"];
  return ["core"];
};

export default function GymDashboard() {
  const sessions = useGymStore((state) => state.sessions);
  const addSession = useGymStore((state) => state.addSession);
  const updateSession = useGymStore((state) => state.updateSession);
  const deleteSession = useGymStore((state) => state.deleteSession);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SessionFormState>(emptyForm);
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>("all");

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sessions],
  );

  const latestSession = sortedSessions[0];

  const filteredSessions = useMemo(
    () =>
      sessionFilter === "all"
        ? sortedSessions
        : sortedSessions.filter((session) => getSessionType(session.title) === sessionFilter),
    [sessionFilter, sortedSessions],
  );

  const gymStats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    let totalTonnage = 0;
    let weekTonnage = 0;
    let totalSets = 0;
    let totalReps = 0;
    let rpeSum = 0;
    let rpeCount = 0;
    let bestOneRepMax = 0;

    const exerciseStats = new Map<string, ExerciseStat>();
    const chartMap = new Map<string, number>();

    sessions.forEach((session) => {
      const sessionTonnage = calculateTonnage(session.exercises);
      const sessionDate = new Date(session.date);

      totalTonnage += sessionTonnage;
      chartMap.set(session.date, (chartMap.get(session.date) ?? 0) + sessionTonnage);

      if (sessionDate >= weekStart) {
        weekTonnage += sessionTonnage;
      }

      session.exercises.forEach((exercise) => {
        const name = exercise.name.trim() || "Без названия";
        const current = exerciseStats.get(name) ?? {
          name,
          tonnage: 0,
          sets: 0,
          reps: 0,
          bestOneRepMax: 0,
          bestWeight: 0,
        };

        exercise.sets.forEach((set) => {
          const oneRepMax = calculateOneRepMax(set.weight, set.reps);
          const tonnage = set.weight * set.reps;

          totalSets += 1;
          totalReps += set.reps;
          bestOneRepMax = Math.max(bestOneRepMax, oneRepMax);

          if (set.rpe) {
            rpeSum += set.rpe;
            rpeCount += 1;
          }

          current.tonnage += tonnage;
          current.sets += 1;
          current.reps += set.reps;
          current.bestOneRepMax = Math.max(current.bestOneRepMax, oneRepMax);
          current.bestWeight = Math.max(current.bestWeight, set.weight);
        });

        exerciseStats.set(name, current);
      });
    });

    const chartData = Array.from(chartMap.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-8)
      .map(([date, tonnage]) => ({
        date: date.slice(5),
        tonnage,
      }));

    return {
      totalTonnage,
      weekTonnage,
      sessionCount: sessions.length,
      totalSets,
      totalReps,
      averageRpe: rpeCount > 0 ? Number((rpeSum / rpeCount).toFixed(1)) : 0,
      bestOneRepMax,
      chartData,
      topExercises: Array.from(exerciseStats.values())
        .sort((a, b) => b.tonnage - a.tonnage)
        .slice(0, 5),
      personalRecords: Array.from(exerciseStats.values())
        .sort((a, b) => b.bestOneRepMax - a.bestOneRepMax)
        .slice(0, 6),
    };
  }, [sessions]);

  const weeklyMuscleSets = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const groups = Object.keys(muscleLabels).reduce(
      (acc, key) => ({ ...acc, [key]: 0 }),
      {} as Record<MuscleGroup, number>,
    );

    sessions.forEach((session) => {
      if (new Date(session.date) < weekStart) return;

      session.exercises.forEach((exercise) => {
        const muscles = getExerciseMuscles(exercise.name);
        muscles.forEach((muscle) => {
          groups[muscle] += exercise.sets.length;
        });
      });
    });

    return groups;
  }, [sessions]);

  const maxMuscleSets = Math.max(...Object.values(weeklyMuscleSets), 1);

  const openCreateModal = () => {
    setForm({
      ...emptyForm(),
      title: "Push",
      exercises: templateExercises.push.map((name) => createExercise(name)),
    });
    setModalOpen(true);
  };

  const openEditModal = (session: GymSession) => {
    setForm(cloneSession(session));
    setModalOpen(true);
  };

  const applyTemplate = (template: WorkoutTemplate) => {
    setForm((current) => ({
      ...current,
      title: templateTitles[template] || current.title,
      exercises: templateExercises[template].map((name) => createExercise(name)),
    }));
  };

  const openTemplateModal = (template: WorkoutTemplate) => {
    setForm({
      ...emptyForm(),
      title: templateTitles[template],
      exercises: templateExercises[template].map((name) => createExercise(name)),
    });
    setModalOpen(true);
  };

  const repeatLastWorkout = () => {
    if (!latestSession) return;

    addSession({
      id: `session-${Date.now()}`,
      date: todayIso(),
      title: latestSession.title,
      exercises: cloneExercisesForNewSession(latestSession.exercises),
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm());
  };

  const updateExercise = (exerciseId: string, field: "name" | "photoUrl", value: string) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise,
      ),
    }));
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps" | "rpe",
    value: number | null,
  ) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value ?? 0 } : set,
              ),
            }
          : exercise,
      ),
    }));
  };

  const addExercise = () => {
    setForm((current) => ({
      ...current,
      exercises: [...current.exercises, createExercise()],
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.filter((exercise) => exercise.id !== exerciseId),
    }));
  };

  const addSet = (exerciseId: string) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, sets: [...exercise.sets, createSet()] } : exercise,
      ),
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
          : exercise,
      ),
    }));
  };

  const saveWorkout = () => {
    const title = form.title.trim();
    const exercises = form.exercises
      .map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
        sets: exercise.sets.filter((set) => set.weight > 0 || set.reps > 0 || set.rpe),
      }))
      .filter((exercise) => exercise.name.length > 0 && exercise.sets.length > 0);

    if (!title || exercises.length === 0) return;

    const session: GymSession = {
      id: form.id ?? `session-${Date.now()}`,
      date: form.date,
      title,
      exercises,
    };

    if (form.id) {
      updateSession(form.id, session);
    } else {
      addSession(session);
    }

    closeModal();
  };

  const confirmDelete = (session: GymSession) => {
    Modal.confirm({
      title: "Удалить тренировку?",
      content: `${session.title} от ${session.date}`,
      okText: "Удалить",
      cancelText: "Оставить",
      okButtonProps: { danger: true },
      onOk: () => deleteSession(session.id),
    });
  };

  const renderSetsTable = (exercise: ExerciseRecord) => {
    const columns: ColumnsType<SetTableRow> = [
      {
        title: "Сет",
        dataIndex: "setNumber",
        width: 70,
        render: (value: number) => <Text type="secondary">{value}</Text>,
      },
      {
        title: "Вес",
        dataIndex: "weight",
        render: (value: number) => <Text strong>{value} кг</Text>,
      },
      {
        title: "Повторы",
        dataIndex: "reps",
        render: (value: number) => <Text style={{ color: "var(--acid)" }}>{value}</Text>,
      },
      {
        title: "RPE",
        dataIndex: "rpe",
        render: (value?: number) => value ?? "-",
      },
      {
        title: "1ПМ",
        key: "oneRepMax",
        render: (_, row) => {
          const oneRepMax = calculateOneRepMax(row.weight, row.reps);
          return oneRepMax > 0 ? `${oneRepMax} кг` : "-";
        },
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={exercise.sets.map((set, index) => ({ ...set, setNumber: index + 1 }))}
        pagination={false}
        rowKey="id"
        scroll={{ x: 420 }}
        size="small"
      />
    );
  };

  return (
    <AppLayout>
      <main className="gym-page" style={{ width: "100%", maxWidth: 1180, margin: "0 auto", padding: "40px 24px 64px" }}>
        <section
          className="gym-hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)",
            gap: 24,
            alignItems: "stretch",
            marginBottom: 24,
          }}
        >
          <div
            className="gym-hero-card"
            style={{
              minHeight: 260,
              padding: 28,
              border: "1px solid var(--line-soft)",
              borderRadius: 8,
              background:
                "linear-gradient(135deg, rgba(215, 255, 69, 0.16), rgba(53, 195, 255, 0.06) 42%, rgba(255, 107, 95, 0.10)), #151713",
              boxShadow: "var(--shadow)",
            }}
          >
            <Text style={{ color: "var(--acid)", fontWeight: 800, textTransform: "uppercase" }}>
              Training log
            </Text>
            <Title style={{ margin: "10px 0 12px", color: "var(--foreground)", fontSize: 52 }}>
              Gym
            </Title>
            <Text style={{ display: "block", maxWidth: 620, color: "var(--muted)", fontSize: 16 }}>
              Вес, подходы, RPE, тоннаж и прогресс по основным движениям.
            </Text>
            <Space size={12} wrap style={{ marginTop: 28 }}>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreateModal}>
                Новая тренировка
              </Button>
              <Button size="large" icon={<CopyOutlined />} disabled={!latestSession} onClick={repeatLastWorkout}>
                Повторить последнюю
              </Button>
              <Text style={{ color: "var(--muted)" }}>
                {gymStats.sessionCount} тренировок · {formatKg(gymStats.totalTonnage)}
              </Text>
            </Space>
          </div>

          <div
            className="gym-activity-card"
            style={{
              width: "100%",
              maxWidth: 360,
              justifySelf: "end",
              padding: 18,
              border: "1px solid var(--line-soft)",
              borderRadius: 8,
              background: "rgba(25, 27, 24, 0.92)",
              boxShadow: "var(--shadow)",
            }}
          >
            <GymActivityPanel sessions={sessions} />
          </div>
        </section>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard label="Тоннаж за 7 дней" value={formatKg(gymStats.weekTonnage)} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard label="Подходы / повторы" value={`${gymStats.totalSets} / ${gymStats.totalReps}`} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard label="Лучший 1ПМ" value={gymStats.bestOneRepMax ? formatKg(gymStats.bestOneRepMax) : "-"} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard label="Средний RPE" value={gymStats.averageRpe ? String(gymStats.averageRpe) : "-"} />
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {latestSession && (
                <PinnedSessionCard
                  session={latestSession}
                  onRepeat={repeatLastWorkout}
                  onEdit={() => openEditModal(latestSession)}
                />
              )}

              <section
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: 16,
                  border: "1px solid var(--line-soft)",
                  borderRadius: 8,
                  background: "rgba(25, 27, 24, 0.82)",
                }}
              >
                <Text style={{ color: "var(--foreground)", fontWeight: 800 }}>Журнал тренировок</Text>
                <Space wrap>
                  {(Object.keys(filterLabels) as SessionFilter[]).map((filter) => (
                    <Button
                      key={filter}
                      type={sessionFilter === filter ? "primary" : "default"}
                      onClick={() => setSessionFilter(filter)}
                    >
                      {filterLabels[filter]}
                    </Button>
                  ))}
                </Space>
              </section>

              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  const sessionTonnage = calculateTonnage(session.exercises);
                  const setsCount = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
                  const heaviestSet = session.exercises
                    .flatMap((exercise) => exercise.sets.map((set) => ({ ...set, exercise: exercise.name })))
                    .sort((a, b) => b.weight - a.weight)[0];

                  return (
                    <article
                      key={session.id}
                      style={{
                        overflow: "hidden",
                        border: "1px solid var(--line-soft)",
                        borderRadius: 8,
                        background: "rgba(25, 27, 24, 0.94)",
                        boxShadow: "0 18px 54px rgba(0, 0, 0, 0.22)",
                      }}
                    >
                      <header
                        className="gym-session-header"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 16,
                          padding: 20,
                          borderBottom: "1px solid var(--line-soft)",
                          background: "rgba(244, 241, 232, 0.035)",
                        }}
                      >
                        <div>
                          <Text style={{ color: "var(--acid)", fontWeight: 800 }}>{session.date}</Text>
                          <Title level={4} style={{ margin: "4px 0 0", color: "var(--foreground)" }}>
                            {session.title}
                          </Title>
                        </div>
                        <Space>
                          <Button icon={<EditOutlined />} onClick={() => openEditModal(session)}>
                            Изменить
                          </Button>
                          <Button danger icon={<DeleteOutlined />} onClick={() => confirmDelete(session)}>
                            Удалить
                          </Button>
                        </Space>
                      </header>

                      <div style={{ display: "grid", gap: 18, padding: 20 }}>
                        <Row gutter={[12, 12]}>
                          <Col xs={12} md={6}>
                            <MiniMetric label="Тоннаж" value={formatKg(sessionTonnage)} />
                          </Col>
                          <Col xs={12} md={6}>
                            <MiniMetric label="Упражнения" value={String(session.exercises.length)} />
                          </Col>
                          <Col xs={12} md={6}>
                            <MiniMetric label="Подходы" value={String(setsCount)} />
                          </Col>
                          <Col xs={12} md={6}>
                            <MiniMetric
                              label="Тяжелый сет"
                              value={heaviestSet ? `${heaviestSet.weight} кг` : "-"}
                            />
                          </Col>
                        </Row>

                        {session.exercises.map((exercise, index) => (
                          <div key={exercise.id} style={{ display: "grid", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <ThunderboltOutlined style={{ color: "var(--acid)" }} />
                              <Text strong style={{ color: "var(--foreground)" }}>
                                {index + 1}. {exercise.name}
                              </Text>
                              <Text type="secondary">{formatKg(calculateTonnage([exercise]))}</Text>
                            </div>
                            {renderSetsTable(exercise)}
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: 48,
                    border: "1px solid var(--line-soft)",
                    borderRadius: 8,
                    background: "rgba(25, 27, 24, 0.9)",
                  }}
                >
                  <Empty description={sessions.length > 0 ? "Нет тренировок под этот фильтр" : "Тренировок пока нет"}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                      Создать первую
                    </Button>
                  </Empty>
                </div>
              )}
            </Space>
          </Col>

          <Col xs={24} lg={8}>
            <aside
              className="gym-side-panel"
              style={{
                position: "sticky",
                top: 24,
                display: "grid",
                gap: 16,
              }}
            >
              <Panel title="План недели">
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {plannedWeek.map((item) => (
                    <div
                      key={`${item.day}-${item.title}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "44px 1fr auto",
                        gap: 12,
                        alignItems: "center",
                        padding: 12,
                        border: "1px solid var(--line-soft)",
                        borderRadius: 8,
                        background: "rgba(17, 19, 15, 0.72)",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          placeItems: "center",
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          color: "#11130f",
                          background: item.accent,
                          fontWeight: 900,
                        }}
                      >
                        {item.day}
                      </div>
                      <div>
                        <Text strong style={{ display: "block", color: "var(--foreground)" }}>
                          {item.title}
                        </Text>
                        <Text type="secondary">{templateExercises[item.template].length} упражнений</Text>
                      </div>
                      <Button size="small" onClick={() => openTemplateModal(item.template)}>
                        Старт
                      </Button>
                    </div>
                  ))}
                </Space>
              </Panel>

              <Panel title="Мышцы за неделю">
                <MuscleFigure weeklySets={weeklyMuscleSets} maxSets={maxMuscleSets} />
              </Panel>

              <Panel title="Личные рекорды">
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {gymStats.personalRecords.length > 0 ? (
                    gymStats.personalRecords.map((exercise) => (
                      <div
                        key={exercise.name}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          paddingBottom: 12,
                          borderBottom: "1px solid var(--line-soft)",
                        }}
                      >
                        <div>
                          <Text strong style={{ display: "block", color: "var(--foreground)" }}>
                            {exercise.name}
                          </Text>
                          <Text type="secondary">Лучший сет: {formatKg(exercise.bestWeight)}</Text>
                        </div>
                        <Text style={{ color: "var(--acid)", fontWeight: 900 }}>
                          {exercise.bestOneRepMax ? formatKg(exercise.bestOneRepMax) : "-"}
                        </Text>
                      </div>
                    ))
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет рекордов" />
                  )}
                </Space>
              </Panel>

              <Panel title="Быстрые шаблоны">
                <Space wrap>
                  {(["push", "pull", "legs", "fullBody", "upperBody", "lowerBody"] as WorkoutTemplate[]).map((template) => (
                    <Button key={template} onClick={() => openTemplateModal(template)}>
                      {templateTitles[template]}
                    </Button>
                  ))}
                </Space>
              </Panel>
            </aside>
          </Col>
        </Row>
      </main>

      <Modal
        title={form.id ? "Изменить тренировку" : "Новая тренировка"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={saveWorkout}
        okText={form.id ? "Сохранить" : "Добавить"}
        cancelText="Отмена"
        width={940}
      >
        <Space direction="vertical" size={18} style={{ width: "100%", marginTop: 12 }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={10}>
              <Text type="secondary">Шаблон</Text>
              <Select
                style={{ width: "100%", marginTop: 6 }}
                defaultValue="push"
                onChange={(value: WorkoutTemplate) => applyTemplate(value)}
                options={[
                  { value: "push", label: "Push" },
                  { value: "pull", label: "Pull" },
                  { value: "legs", label: "Legs" },
                  { value: "fullBody", label: "Full body" },
                  { value: "upperBody", label: "Upper body" },
                  { value: "lowerBody", label: "Lower body" },
                  { value: "custom", label: "Custom" },
                ]}
              />
            </Col>
            <Col xs={24} md={10}>
              <Text type="secondary">Название</Text>
              <Input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Например: Push"
                style={{ marginTop: 6 }}
              />
            </Col>
            <Col xs={24} md={4}>
              <Text type="secondary">Дата</Text>
              <Input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                style={{ marginTop: 6 }}
              />
            </Col>
          </Row>

          <Space direction="vertical" size={14} style={{ width: "100%" }}>
            {form.exercises.map((exercise, exerciseIndex) => (
              <div
                key={exercise.id}
                style={{
                  padding: 16,
                  border: "1px solid var(--line-soft)",
                  borderRadius: 8,
                  background: "rgba(244, 241, 232, 0.035)",
                }}
              >
                <Row gutter={[10, 10]} align="middle" style={{ marginBottom: 12 }}>
                  <Col xs={24} md={14}>
                    <Text type="secondary">Упражнение {exerciseIndex + 1}</Text>
                    <Input
                      value={exercise.name}
                      onChange={(event) => updateExercise(exercise.id, "name", event.target.value)}
                      placeholder="Жим лежа"
                      style={{ marginTop: 6 }}
                    />
                  </Col>
                  <Col xs={24} md={7}>
                    <Text type="secondary">Фото URL</Text>
                    <Input
                      value={exercise.photoUrl ?? ""}
                      onChange={(event) => updateExercise(exercise.id, "photoUrl", event.target.value)}
                      placeholder="Опционально"
                      style={{ marginTop: 6 }}
                    />
                  </Col>
                  <Col xs={24} md={3}>
                    <Button danger block icon={<DeleteOutlined />} onClick={() => removeExercise(exercise.id)}>
                      Убрать
                    </Button>
                  </Col>
                </Row>

                <div style={{ display: "grid", gap: 8 }}>
                  {exercise.sets.map((set, setIndex) => {
                    const oneRepMax = calculateOneRepMax(set.weight, set.reps);
                    const percentage = calculatePercentage(set.weight, oneRepMax);

                    return (
                      <Row key={set.id} gutter={[8, 8]} align="middle">
                        <Col xs={4} md={2}>
                          <Text strong>{setIndex + 1}</Text>
                        </Col>
                        <Col xs={10} md={4}>
                          <InputNumber
                            min={0}
                            value={set.weight}
                            onChange={(value) => updateSet(exercise.id, set.id, "weight", value)}
                            addonAfter="кг"
                            style={{ width: "100%" }}
                          />
                        </Col>
                        <Col xs={10} md={4}>
                          <InputNumber
                            min={0}
                            value={set.reps}
                            onChange={(value) => updateSet(exercise.id, set.id, "reps", value)}
                            addonAfter="повт"
                            style={{ width: "100%" }}
                          />
                        </Col>
                        <Col xs={10} md={4}>
                          <InputNumber
                            min={1}
                            max={10}
                            step={0.5}
                            value={set.rpe}
                            onChange={(value) => updateSet(exercise.id, set.id, "rpe", value)}
                            placeholder="RPE"
                            style={{ width: "100%" }}
                          />
                        </Col>
                        <Col xs={7} md={4}>
                          <Text type="secondary">1ПМ {oneRepMax || "-"}</Text>
                        </Col>
                        <Col xs={7} md={3}>
                          <Text type="secondary">{percentage || "-"}%</Text>
                        </Col>
                        <Col xs={24} md={3}>
                          <Button
                            danger
                            block
                            size="small"
                            onClick={() => removeSet(exercise.id, set.id)}
                            disabled={exercise.sets.length === 1}
                          >
                            Удалить
                          </Button>
                        </Col>
                      </Row>
                    );
                  })}
                </div>

                <Space style={{ marginTop: 12 }}>
                  <Button size="small" onClick={() => addSet(exercise.id)}>
                    + Подход
                  </Button>
                  <Text type="secondary">Тоннаж: {formatKg(calculateTonnage([exercise]))}</Text>
                </Space>
              </div>
            ))}
          </Space>

          <Button block icon={<PlusOutlined />} onClick={addExercise}>
            Добавить упражнение
          </Button>
        </Space>
      </Modal>
    </AppLayout>
  );
}

function getGymActivityColor(value: number) {
  if (value <= 0) return "rgba(244, 241, 232, 0.07)";
  if (value < 500) return "rgba(244, 241, 232, 0.26)";
  if (value < 1500) return "rgba(244, 241, 232, 0.48)";
  if (value < 3000) return "rgba(244, 241, 232, 0.72)";
  return "#f4f1e8";
}

function GymActivityPanel({ sessions }: { sessions: GymSession[] }) {
  const activity = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = addDays(today, -55);
    const data = new Map<string, number>();

    sessions.forEach((session) => {
      data.set(session.date, (data.get(session.date) ?? 0) + calculateTonnage(session.exercises));
    });

    const days = Array.from({ length: 56 }, (_, index) => {
      const date = addDays(start, index);
      const dateKey = toDateKey(date);
      return {
        dateKey,
        label: dateKey.slice(5),
        value: data.get(dateKey) ?? 0,
      };
    });

    const total = days.reduce((sum, day) => sum + day.value, 0);
    const activeDays = days.filter((day) => day.value > 0).length;

    return { days, total, activeDays };
  }, [sessions]);

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <Text style={{ color: "var(--muted)", fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>
            Активность зал
          </Text>
          <Title level={4} style={{ margin: "4px 0 0", color: "var(--foreground)" }}>
            8 недель
          </Title>
        </div>
        <div style={{ textAlign: "right" }}>
          <Text style={{ display: "block", color: "var(--foreground)", fontSize: 18, fontWeight: 950 }}>
            {Math.round(activity.total).toLocaleString("ru-RU")} кг
          </Text>
          <Text type="secondary">{activity.activeDays} дней</Text>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, max-content)", gap: 5, marginTop: 20 }}>
        {Array.from({ length: 8 }, (_, weekIndex) => (
          <div key={weekIndex} style={{ display: "grid", gap: 5 }}>
            {activity.days.slice(weekIndex * 7, weekIndex * 7 + 7).map((day) => (
              <div
                key={day.dateKey}
                title={`${day.dateKey}: ${Math.round(day.value).toLocaleString("ru-RU")} кг`}
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: 3,
                  background: getGymActivityColor(day.value),
                  border: "1px solid rgba(244, 241, 232, 0.08)",
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Меньше
        </Text>
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 500, 1500, 3000].map((value) => (
            <div
              key={value}
              style={{
                width: 15,
                height: 15,
                borderRadius: 3,
                background: getGymActivityColor(value),
                border: "1px solid rgba(244, 241, 232, 0.08)",
              }}
            />
          ))}
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Больше
        </Text>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="gym-stat-card"
      style={{
        position: "relative",
        minHeight: 220,
        padding: "28px 22px 24px",
        border: "1px solid rgba(244, 241, 232, 0.42)",
        borderRadius: 8,
        background:
          "linear-gradient(180deg, rgba(244, 241, 232, 0.11), rgba(244, 241, 232, 0.018)), #0c0d0b",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 44px rgba(0,0,0,0.26)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: 8,
          background: "#f4f1e8",
        }}
      />
      <div>
        <div
          style={{
            width: 42,
            height: 4,
            marginBottom: 18,
            borderRadius: 4,
            background: "#f4f1e8",
          }}
        />
        <Text style={{ color: "rgba(244, 241, 232, 0.72)", fontSize: 12, fontWeight: 950, textTransform: "uppercase" }}>
          {label}
        </Text>
      </div>
      <div
        style={{
          marginTop: 30,
          color: "#f4f1e8",
          fontSize: 42,
          fontWeight: 950,
          lineHeight: 0.96,
          letterSpacing: 0,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="gym-mini-metric"
      style={{
        padding: 12,
        border: "1px solid var(--line-soft)",
        borderRadius: 8,
        background: "rgba(17, 19, 15, 0.72)",
      }}
    >
      <Text style={{ display: "block", color: "var(--muted)", fontSize: 12 }}>{label}</Text>
      <Text strong style={{ color: "var(--foreground)" }}>
        {value}
      </Text>
    </div>
  );
}

function PinnedSessionCard({
  session,
  onRepeat,
  onEdit,
}: {
  session: GymSession;
  onRepeat: () => void;
  onEdit: () => void;
}) {
  const setsCount = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);

  return (
    <section
      className="gym-pinned-session"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 16,
        alignItems: "center",
        padding: 18,
        border: "1px solid rgba(215, 255, 69, 0.36)",
        borderRadius: 8,
        background: "linear-gradient(135deg, rgba(215, 255, 69, 0.12), rgba(53, 195, 255, 0.06)), #191b18",
        boxShadow: "0 18px 54px rgba(0, 0, 0, 0.22)",
      }}
    >
      <div>
        <Text style={{ color: "var(--acid)", fontWeight: 900, textTransform: "uppercase" }}>
          Последняя тренировка
        </Text>
        <Title level={4} style={{ margin: "6px 0 4px", color: "var(--foreground)" }}>
          {session.title}
        </Title>
        <Text type="secondary">
          {session.date} · {session.exercises.length} упражнений · {setsCount} подходов ·{" "}
          {formatKg(calculateTonnage(session.exercises))}
        </Text>
      </div>
      <Space wrap style={{ justifyContent: "flex-end" }}>
        <Button icon={<CopyOutlined />} onClick={onRepeat}>
          Повторить сегодня
        </Button>
        <Button icon={<EditOutlined />} onClick={onEdit}>
          Изменить
        </Button>
      </Space>
    </section>
  );
}

function MuscleFigure({
  weeklySets,
  maxSets,
}: {
  weeklySets: Record<MuscleGroup, number>;
  maxSets: number;
}) {
  const getZoneStyle = (group: MuscleGroup): React.CSSProperties => {
    const intensity = 0.24 + (weeklySets[group] / maxSets) * 0.76;

    return {
      fill: muscleColors[group],
      opacity: intensity,
      filter: `drop-shadow(0 0 ${4 + intensity * 8}px ${muscleColors[group]})`,
    };
  };

  return (
    <div>
      <style>
        {`
          .gym-muscle-zone {
            transition: opacity 160ms ease, stroke-width 160ms ease, transform 160ms ease;
            transform-box: fill-box;
            transform-origin: center;
          }

          .gym-muscle-zone:hover {
            opacity: 1 !important;
            stroke-width: 2.4;
            transform: scale(1.025);
          }
        `}
      </style>
      <div
        style={{
          position: "relative",
          display: "grid",
          placeItems: "center",
          minHeight: 390,
          border: "1px solid var(--line-soft)",
          borderRadius: 8,
          background:
            "radial-gradient(circle at 50% 18%, rgba(53, 195, 255, 0.14), transparent 34%), linear-gradient(180deg, rgba(244, 241, 232, 0.045), transparent), #11130f",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(100%, 300px)",
            height: 360,
          }}
        >
          <svg
            aria-label="Карта мышечных групп за неделю"
            role="img"
            viewBox="0 0 300 360"
            width="100%"
            height="100%"
            style={{
              display: "block",
              overflow: "visible",
            }}
          >
            <defs>
              <linearGradient id="gymSkinBase" x1="84" x2="216" y1="28" y2="332" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f7f3e8" stopOpacity="0.98" />
                <stop offset="48%" stopColor="#c8c5b8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#777b72" stopOpacity="0.86" />
              </linearGradient>
              <linearGradient id="gymModelShadow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
                <stop offset="42%" stopColor="#000000" stopOpacity="0" />
                <stop offset="58%" stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
              </linearGradient>
              <radialGradient id="gymHeadLight" cx="42%" cy="32%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.36" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <filter id="gymSoftInset" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000000" floodOpacity="0.28" />
              </filter>
            </defs>

            <ellipse cx="150" cy="337" rx="88" ry="13" fill="#000" opacity="0.32" />
            <path
              d="M150 54
                 C122 54 102 67 93 91
                 C84 116 78 143 68 174
                 C64 188 69 201 82 203
                 C94 205 99 195 101 184
                 L109 142
                 C113 171 114 194 112 217
                 L99 303
                 C96 320 104 331 119 331
                 C132 331 138 322 140 308
                 L150 249
                 L160 308
                 C162 322 168 331 181 331
                 C196 331 204 320 201 303
                 L188 217
                 C186 194 187 171 191 142
                 L199 184
                 C201 195 206 205 218 203
                 C231 201 236 188 232 174
                 C222 143 216 116 207 91
                 C198 67 178 54 150 54 Z"
              fill="url(#gymSkinBase)"
              filter="url(#gymSoftInset)"
              stroke="rgba(244, 241, 232, 0.58)"
              strokeWidth="1.8"
            />
            <path
              d="M150 54
                 C122 54 102 67 93 91
                 C84 116 78 143 68 174
                 C64 188 69 201 82 203
                 C94 205 99 195 101 184
                 L109 142
                 C113 171 114 194 112 217
                 L99 303
                 C96 320 104 331 119 331
                 C132 331 138 322 140 308
                 L150 249
                 L160 308
                 C162 322 168 331 181 331
                 C196 331 204 320 201 303
                 L188 217
                 C186 194 187 171 191 142
                 L199 184
                 C201 195 206 205 218 203
                 C231 201 236 188 232 174
                 C222 143 216 116 207 91
                 C198 67 178 54 150 54 Z"
              fill="url(#gymModelShadow)"
              opacity="0.65"
            />
            <path d="M132 53 C137 66 143 72 150 72 C157 72 163 66 168 53 L168 83 L132 83 Z" fill="#b8b6aa" opacity="0.8" />
            <circle cx="150" cy="31" r="23" fill="url(#gymSkinBase)" stroke="rgba(244, 241, 232, 0.58)" strokeWidth="1.8" />
            <circle cx="150" cy="31" r="21" fill="url(#gymHeadLight)" />
            <path
              d="M134 47 C140 54 144 57 150 57 C156 57 160 54 166 47"
              fill="none"
              stroke="rgba(17, 19, 15, 0.5)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <g stroke="rgba(17, 19, 15, 0.64)" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round">
              <path className="gym-muscle-zone" d="M94 94 C102 73 121 66 141 74 C129 81 116 91 107 112 C100 108 95 102 94 94 Z" style={getZoneStyle("shoulders")}>
                <title>{`${muscleLabels.shoulders}: ${weeklySets.shoulders} подходов за неделю`}</title>
              </path>
              <path className="gym-muscle-zone" d="M206 94 C198 73 179 66 159 74 C171 81 184 91 193 112 C200 108 205 102 206 94 Z" style={getZoneStyle("shoulders")}>
                <title>{`${muscleLabels.shoulders}: ${weeklySets.shoulders} подходов за неделю`}</title>
              </path>

              <path className="gym-muscle-zone" d="M112 88 C124 78 139 78 146 88 L146 126 C128 126 114 116 108 101 C106 96 108 91 112 88 Z" style={getZoneStyle("chest")}>
                <title>{`${muscleLabels.chest}: ${weeklySets.chest} подходов за неделю`}</title>
              </path>
              <path className="gym-muscle-zone" d="M188 88 C176 78 161 78 154 88 L154 126 C172 126 186 116 192 101 C194 96 192 91 188 88 Z" style={getZoneStyle("chest")}>
                <title>{`${muscleLabels.chest}: ${weeklySets.chest} подходов за неделю`}</title>
              </path>

              <path className="gym-muscle-zone" d="M102 116 C91 132 86 154 84 183 C100 172 110 146 116 122 C111 121 106 119 102 116 Z" style={getZoneStyle("back")}>
                <title>{`${muscleLabels.back}: ${weeklySets.back} подходов за неделю`}</title>
              </path>
              <path className="gym-muscle-zone" d="M198 116 C209 132 214 154 216 183 C200 172 190 146 184 122 C189 121 194 119 198 116 Z" style={getZoneStyle("back")}>
                <title>{`${muscleLabels.back}: ${weeklySets.back} подходов за неделю`}</title>
              </path>

              <path className="gym-muscle-zone" d="M126 132 L146 132 L144 190 L122 190 C119 168 120 148 126 132 Z" style={getZoneStyle("core")}>
                <title>{`${muscleLabels.core}: ${weeklySets.core} подходов за неделю`}</title>
              </path>
              <path className="gym-muscle-zone" d="M154 132 L174 132 C180 148 181 168 178 190 L156 190 L154 132 Z" style={getZoneStyle("core")}>
                <title>{`${muscleLabels.core}: ${weeklySets.core} подходов за неделю`}</title>
              </path>

              <path className="gym-muscle-zone" d="M78 99 C65 121 56 154 55 181 C54 194 61 200 72 196 C80 159 89 127 99 106 C92 101 85 98 78 99 Z" style={getZoneStyle("arms")}>
                <title>{`${muscleLabels.arms}: ${weeklySets.arms} подходов за неделю`}</title>
              </path>
              <path className="gym-muscle-zone" d="M222 99 C235 121 244 154 245 181 C246 194 239 200 228 196 C220 159 211 127 201 106 C208 101 215 98 222 99 Z" style={getZoneStyle("arms")}>
                <title>{`${muscleLabels.arms}: ${weeklySets.arms} подходов за неделю`}</title>
              </path>

              <path className="gym-muscle-zone" d="M116 194 C131 187 143 190 150 204 L150 228 C134 228 119 218 112 205 C110 201 112 197 116 194 Z" style={getZoneStyle("glutes")}>
                <title>{`${muscleLabels.glutes}: ${weeklySets.glutes} подходов за неделю`}</title>
              </path>
              <path className="gym-muscle-zone" d="M184 194 C169 187 157 190 150 204 L150 228 C166 228 181 218 188 205 C190 201 188 197 184 194 Z" style={getZoneStyle("glutes")}>
                <title>{`${muscleLabels.glutes}: ${weeklySets.glutes} подходов за неделю`}</title>
              </path>

              <path className="gym-muscle-zone" d="M114 225 C131 228 140 243 139 263 L133 308 C131 321 125 326 117 324 C106 322 103 313 106 300 L114 254 C116 242 116 233 114 225 Z" style={getZoneStyle("legs")}>
                <title>{`${muscleLabels.legs}: ${weeklySets.legs} подходов за неделю`}</title>
              </path>
              <path className="gym-muscle-zone" d="M186 225 C169 228 160 243 161 263 L167 308 C169 321 175 326 183 324 C194 322 197 313 194 300 L186 254 C184 242 184 233 186 225 Z" style={getZoneStyle("legs")}>
                <title>{`${muscleLabels.legs}: ${weeklySets.legs} подходов за неделю`}</title>
              </path>
            </g>

            <g fill="none" stroke="rgba(17, 19, 15, 0.44)" strokeLinecap="round" strokeLinejoin="round">
              <path d="M150 82 L150 228" strokeWidth="1.55" />
              <path d="M128 145 C136 148 144 149 150 149 C156 149 164 148 172 145" />
              <path d="M126 163 C135 166 144 167 150 167 C156 167 165 166 174 163" />
              <path d="M128 181 C137 184 144 185 150 185 C156 185 163 184 172 181" />
              <path d="M122 243 C130 253 134 267 134 284" />
              <path d="M178 243 C170 253 166 267 166 284" />
              <path d="M112 91 C124 97 137 100 150 100 C163 100 176 97 188 91" opacity="0.48" />
            </g>
          </svg>
        </div>
      </div>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {(Object.keys(muscleLabels) as MuscleGroup[]).map((group) => (
          <div key={group} style={{ display: "grid", gridTemplateColumns: "86px 1fr 34px", gap: 8, alignItems: "center" }}>
            <Text type="secondary">{muscleLabels[group]}</Text>
            <div style={{ height: 8, borderRadius: 8, background: "rgba(244, 241, 232, 0.08)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.max(6, (weeklySets[group] / maxSets) * 100)}%`,
                  height: "100%",
                  background: muscleColors[group],
                }}
              />
            </div>
            <Text style={{ color: "var(--foreground)", textAlign: "right" }}>{weeklySets[group]}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="gym-panel"
      style={{
        padding: 20,
        border: "1px solid var(--line-soft)",
        borderRadius: 8,
        background: "rgba(25, 27, 24, 0.92)",
      }}
    >
      <Title level={4} style={{ marginTop: 0, color: "var(--foreground)" }}>
        {title}
      </Title>
      {children}
    </section>
  );
}
