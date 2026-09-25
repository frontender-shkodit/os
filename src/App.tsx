import { FormEvent, useRef, useState } from 'react'

type FormState = {
  developerName: string
  projectTeam: string
  evaluatorNameAndRole: string
  readiness: Record<string, number | null>
  projectLoad: string
  weeklyTime: string
  observedCompetencies: string[]
  observedCompetenciesOther: string
  taskExamples: string
  developmentDirections: string[]
  developmentDirectionsOther: string
  practiceTasks: string
  mentorSupport: string
  pilotRecommendation: string
  recommendationExplanation: string
}

const readinessCriteria = [
  'Самостоятельность в решении задач',
  'Способность быстро осваивать новые технологии',
  'Умение разбираться в незнакомом коде / предметной области',
  'Инициативность',
  'Ответственность за результат',
  'Качество коммуникации со смежными ролями',
  'Готовность делиться знаниями',
  'Потенциал менторить / быть «агентом изменений»',
]

const observedOptions = [
  'Backend',
  'Архитектура',
  'Аналитика',
  'DevOps',
  'Автоматизация тестирования',
  'ML / AI',
  'Работа с AI-инструментами',
  'Не наблюдалось',
]

const directionOptions = [
  'Vue / Angular',
  'Backend',
  'Системная архитектура',
  'Аналитика',
  'DevOps',
  'Автоматизация тестирования',
  'ML / AI / LLM',
]

const initial: FormState = {
  developerName: '',
  projectTeam: '',
  evaluatorNameAndRole: '',
  readiness: Object.fromEntries(readinessCriteria.map((x) => [x, null])),
  projectLoad: '',
  weeklyTime: '',
  observedCompetencies: [],
  observedCompetenciesOther: '',
  taskExamples: '',
  developmentDirections: [],
  developmentDirectionsOther: '',
  practiceTasks: '',
  mentorSupport: '',
  pilotRecommendation: '',
  recommendationExplanation: '',
}

function App() {
  const [form, setForm] = useState<FormState>(initial)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const topRef = useRef<HTMLElement>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const toggle = (
    key: 'observedCompetencies' | 'developmentDirections',
    value: string,
  ) => {
    const current = form[key]

    // "Не наблюдалось" логически исключает конкретные наблюдавшиеся компетенции.
    if (key === 'observedCompetencies') {
      if (value === 'Не наблюдалось') {
        set(key, (current.includes(value) ? [] : ['Не наблюдалось']) as FormState[typeof key])
        return
      }

      const withoutNone = current.filter((item) => item !== 'Не наблюдалось')
      set(
        key,
        (withoutNone.includes(value)
          ? withoutNone.filter((item) => item !== value)
          : [...withoutNone, value]) as FormState[typeof key],
      )
      return
    }

    set(
      key,
      (current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]) as FormState[typeof key],
    )
  }

  const text = (label: string, key: keyof FormState, multiline = false) => (
    <label className="q">
      <span>
        {label} <b>*</b>
      </span>
      {multiline ? (
        <textarea
          value={form[key] as string}
          onChange={(e) => set(key, e.target.value as never)}
        />
      ) : (
        <input
          value={form[key] as string}
          onChange={(e) => set(key, e.target.value as never)}
        />
      )}
    </label>
  )

  const radio = (label: string, key: keyof FormState, options: string[]) => (
    <fieldset className="q">
      <legend>
        {label} <b>*</b>
      </legend>
      <div className="choices">
        {options.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name={String(key)}
              checked={form[key] === option}
              onChange={() => set(key, option as never)}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )

  const submit = (event: FormEvent) => {
    event.preventDefault()

    const ratingsComplete = Object.values(form.readiness).every(
      (value) => value !== null,
    )

    const valid =
      form.developerName.trim() &&
      form.projectTeam.trim() &&
      form.evaluatorNameAndRole.trim() &&
      ratingsComplete &&
      form.projectLoad &&
      form.weeklyTime &&
      form.observedCompetencies.length > 0 &&
      form.taskExamples.trim() &&
      form.developmentDirections.length > 0 &&
      form.practiceTasks &&
      form.mentorSupport &&
      form.pilotRecommendation &&
      form.recommendationExplanation.trim()

    if (!valid) {
      setError('Заполните все обязательные вопросы.')
      setResult('')
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    setError('')

    const data = {
      questionnaireId: 'developer-teamlead-assessment-v1',
      questionnaireVersion: 1,
      completedAt: new Date().toISOString(),
      answers: {
        // 1. ФИО разработчика
        developerName: form.developerName,

        // 2. Проект / команда
        projectTeam: form.projectTeam,

        // 3. ФИО и роль оценивающего
        evaluatorNameAndRole: form.evaluatorNameAndRole,

        // Блок 1. Готовность к расширению компетенций (1–5)
        readiness: {
          // Самостоятельность в решении задач
          independence: form.readiness['Самостоятельность в решении задач'],
          // Способность быстро осваивать новые технологии
          learningSpeed:
            form.readiness['Способность быстро осваивать новые технологии'],
          // Умение разбираться в незнакомом коде / предметной области
          unfamiliarCodeAndDomain:
            form.readiness[
              'Умение разбираться в незнакомом коде / предметной области'
            ],
          // Инициативность
          initiative: form.readiness['Инициативность'],
          // Ответственность за результат
          resultOwnership: form.readiness['Ответственность за результат'],
          // Качество коммуникации со смежными ролями
          crossRoleCommunication:
            form.readiness['Качество коммуникации со смежными ролями'],
          // Готовность делиться знаниями
          knowledgeSharing: form.readiness['Готовность делиться знаниями'],
          // Потенциал менторить / быть «агентом изменений»
          mentoringChangeAgentPotential:
            form.readiness['Потенциал менторить / быть «агентом изменений»'],
        },

        // 4. Насколько текущая проектная загрузка позволяет разработчику участвовать в пилоте?
        projectLoadForPilot: form.projectLoad,

        // 5. Сколько времени в неделю команда реально может выделить разработчику на обучение и практику?
        weeklyLearningAndPracticeTime: form.weeklyTime,

        // 6. Какие смежные компетенции у разработчика уже проявлялись на реальных задачах?
        observedAdjacentCompetencies: [
          ...form.observedCompetencies,
          ...(form.observedCompetenciesOther.trim()
            ? [`Другое: ${form.observedCompetenciesOther.trim()}`]
            : []),
        ],

        // 7. Приведите 1–2 примера задач, подтверждающих эту оценку.
        supportingTaskExamples: form.taskExamples,

        // 8. В каких направлениях развитие этого разработчика будет наиболее полезно текущему или будущим проектам?
        usefulDevelopmentDirections: [
          ...form.developmentDirections,
          ...(form.developmentDirectionsOther.trim()
            ? [`Другое: ${form.developmentDirectionsOther.trim()}`]
            : []),
        ],

        // 9. Есть ли на текущем проекте реальные задачи для практики этого разработчика в выбранном направлении?
        realPracticeTasks: form.practiceTasks,

        // 10. Готов ли тимлид / команда обеспечить review или менторскую поддержку?
        mentorReviewSupport: form.mentorSupport,

        // 11. Как вы оцениваете целесообразность включения разработчика в пилотную группу?
        pilotRecommendation: form.pilotRecommendation,

        // 12. Кратко поясните оценку: сильные стороны, риски и условия успешного участия.
        recommendationExplanation: form.recommendationExplanation,
      },
    }

    setResult(JSON.stringify(data, null, 2))
  }

  return (
    <main ref={topRef}>
      <header>
        <h1>Оценка разработчика тимлидом</h1>
        <p>
          Цель: дополнить самооценку разработчика независимой оценкой руководителя
          и получить данные для формирования пилотной группы. Анкета не
          предназначена для performance review.
        </p>
      </header>

      {error && <div className="error">{error}</div>}

      <form onSubmit={submit}>
        <section>
          <h2>Общая информация</h2>
          {text('1. ФИО разработчика', 'developerName')}
          {text('2. Проект / команда', 'projectTeam')}
          {text('3. ФИО и роль оценивающего', 'evaluatorNameAndRole')}
        </section>

        <section>
          <h2>Блок 1. Готовность к расширению компетенций</h2>
          <p className="hint">
            Шкала: 1 — низко / почти не проявляется; 5 — очень высоко /
            стабильно проявляется.
          </p>

          <div className="ratings">
            {readinessCriteria.map((criterion) => (
              <div className="rating" key={criterion}>
                <span>{criterion}</span>
                <div>
                  {[1, 2, 3, 4, 5].map((number) => (
                    <label key={number}>
                      <input
                        type="radio"
                        name={criterion}
                        checked={form.readiness[criterion] === number}
                        onChange={() =>
                          setForm((current) => ({
                            ...current,
                            readiness: {
                              ...current.readiness,
                              [criterion]: number,
                            },
                          }))
                        }
                      />
                      <i>{number}</i>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Блок 2. Практическая готовность</h2>

          {radio(
            '4. Насколько текущая проектная загрузка позволяет разработчику участвовать в пилоте?',
            'projectLoad',
            [
              'Есть достаточный резерв',
              'Можно выделить время при планировании',
              'Сложно, но возможно',
              'В ближайшее время практически невозможно',
            ],
          )}

          {radio(
            '5. Сколько времени в неделю команда реально может выделить разработчику на обучение и практику?',
            'weeklyTime',
            [
              '1–2 часа',
              '3–4 часа',
              '5–8 часов',
              '8+ часов',
              'Сейчас выделить время невозможно',
            ],
          )}

          <fieldset className="q">
            <legend>
              6. Какие смежные компетенции у разработчика уже проявлялись на
              реальных задачах? <b>*</b>
            </legend>

            <div className="choices grid">
              {observedOptions.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={form.observedCompetencies.includes(option)}
                    onChange={() => toggle('observedCompetencies', option)}
                  />
                  {option}
                </label>
              ))}
            </div>

            <input
              placeholder="Другое"
              value={form.observedCompetenciesOther}
              onChange={(e) =>
                set('observedCompetenciesOther', e.target.value)
              }
            />
          </fieldset>

          {text(
            '7. Приведите 1–2 примера задач, подтверждающих эту оценку.',
            'taskExamples',
            true,
          )}
        </section>

        <section>
          <h2>Блок 3. Рекомендация по пилоту</h2>

          <fieldset className="q">
            <legend>
              8. В каких направлениях развитие этого разработчика будет наиболее
              полезно текущему или будущим проектам? <b>*</b>
            </legend>

            <div className="choices grid">
              {directionOptions.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={form.developmentDirections.includes(option)}
                    onChange={() => toggle('developmentDirections', option)}
                  />
                  {option}
                </label>
              ))}
            </div>

            <input
              placeholder="Другое"
              value={form.developmentDirectionsOther}
              onChange={(e) =>
                set('developmentDirectionsOther', e.target.value)
              }
            />
          </fieldset>

          {radio(
            '9. Есть ли на текущем проекте реальные задачи для практики этого разработчика в выбранном направлении?',
            'practiceTasks',
            [
              'Да, уже есть',
              'Вероятно появятся в ближайшие 1–3 месяца',
              'Нет',
            ],
          )}

          {radio(
            '10. Готов ли тимлид / команда обеспечить review или менторскую поддержку?',
            'mentorSupport',
            ['Да', 'Частично', 'Нет'],
          )}

          {radio(
            '11. Как вы оцениваете целесообразность включения разработчика в пилотную группу?',
            'pilotRecommendation',
            [
              'Высокая — рекомендую включить',
              'Средняя — можно включить при наличии ресурса',
              'Пока рано — сначала нужны базовые навыки',
              'Не рекомендую в текущем периоде из-за проектной загрузки',
            ],
          )}

          {text(
            '12. Кратко поясните оценку: сильные стороны, риски и условия успешного участия.',
            'recommendationExplanation',
            true,
          )}
        </section>

        <button className="primary" type="submit">
          Результат
        </button>
      </form>

      {result && (
        <section className="result">
          <div className="resultHead">
            <h2>Результат JSON</h2>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              Скопировать JSON
            </button>
          </div>
          <pre>{result}</pre>
        </section>
      )}
    </main>
  )
}
export default App
