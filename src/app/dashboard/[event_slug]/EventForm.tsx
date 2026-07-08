"use client";

import { useState } from "react";
import {
  saveEventEnrollments,
  StudentInfo,
  EnrollmentActionError,
} from "../actions";
import { Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";

interface EventFormProps {
  eventSlug: string;
  minSize: number;
  maxSize: number;
  maxTeams: number;
  initialTeams: StudentInfo[][];
  isTeacherEvent?: boolean;
  eventCategory?: string;
  adminSchoolId?: string;
}

const emptyStudent: StudentInfo = {
  name: "",
  className: "",
  section: "",
  admissionNumber: "",
};

const getAllowedClasses = (category: string) => {
  if (category.includes("Tiny Tots")) return ["Pre-KG", "LKG", "UKG"];
  if (category.includes("Energetic Kids")) return ["I", "II", "III"];
  if (category.includes("Young Visionaries")) return ["IV", "V", "VI"];
  if (category.includes("Emerging Stars")) return ["VII", "VIII", "IX"];
  if (category.includes("Teen Trailblazers")) return ["X", "XI", "XII"];
  return [
    "Pre-KG",
    "LKG",
    "UKG",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
};

export default function EventForm({
  eventSlug,
  minSize,
  maxSize,
  maxTeams,
  initialTeams,
  isTeacherEvent = false,
  eventCategory = "",
  adminSchoolId,
}: EventFormProps) {
  const allowedClasses = getAllowedClasses(eventCategory);

  const startingTeams = initialTeams.length > 0 ? initialTeams : [[]];

  const paddedTeams = startingTeams.map((teamStudents) => {
    const padded = Array(maxSize)
      .fill(null)
      .map(() => ({ ...emptyStudent, className: allowedClasses[0] }));
    teamStudents.forEach((student, i) => {
      if (i < maxSize) {
        // If they had an old class but it's not in the allowed list, default to the first allowed class
        const cls = allowedClasses.includes(student.className)
          ? student.className
          : allowedClasses[0];
        padded[i] = {
          ...emptyStudent,
          ...student,
          className: cls,
          section: student.section || "",
        };
      }
    });
    return padded;
  });

  const [teams, setTeams] = useState<StudentInfo[][]>(paddedTeams);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnrollmentActionError | null>(null);
  const [success, setSuccess] = useState(false);

  const showFormError = (
    message: string,
    title = "Check the registration details",
  ) => {
    setError({ title, message });
  };

  const handleFieldChange = (
    teamIndex: number,
    studentIndex: number,
    field: keyof StudentInfo,
    value: string,
  ) => {
    const newTeams = [...teams];
    newTeams[teamIndex] = [...newTeams[teamIndex]];
    newTeams[teamIndex][studentIndex] = {
      ...newTeams[teamIndex][studentIndex],
      [field]: value,
    };

    // Automatically set class if not set and there's only one option
    if (
      field === "name" &&
      allowedClasses.length === 1 &&
      !newTeams[teamIndex][studentIndex].className
    ) {
      newTeams[teamIndex][studentIndex].className = allowedClasses[0];
    }

    setTeams(newTeams);
    setSuccess(false);
  };

  const addTeam = () => {
    if (teams.length < maxTeams) {
      setTeams([
        ...teams,
        Array(maxSize)
          .fill(null)
          .map(() => ({ ...emptyStudent, className: allowedClasses[0] })),
      ]);
      setSuccess(false);
    }
  };

  const removeTeam = (index: number) => {
    const newTeams = teams.filter((_, i) => i !== index);
    setTeams(newTeams);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const nameRegex = /^[A-Za-z\s\-']*[A-Za-z][A-Za-z\s\-']*$/;
    const sectionRegex = /^[A-Za-z0-9]{1,5}$/;
    const admissionRegex = /^[A-Za-z0-9\-\/]{1,20}$/;

    // Validate teams
    for (let i = 0; i < teams.length; i++) {
      const validStudents = teams[i].filter((s) =>
        isTeacherEvent
          ? s.name.trim().length > 0
          : s.name.trim().length > 0 &&
            s.className.trim().length > 0 &&
            s.section.trim().length > 0 &&
            s.admissionNumber.trim().length > 0,
      );

      // Check for partial filling
      const partialStudents = teams[i]
        .map((s, idx) => ({ s, idx }))
        .filter(({ s }) => {
          if (isTeacherEvent) return false;
          const hasSome =
            s.name.trim().length > 0 ||
            s.className.trim().length > 0 ||
            s.section.trim().length > 0 ||
            s.admissionNumber.trim().length > 0;
          const hasAll =
            s.name.trim().length > 0 &&
            s.className.trim().length > 0 &&
            s.section.trim().length > 0 &&
            s.admissionNumber.trim().length > 0;
          return hasSome && !hasAll;
        });

      if (partialStudents.length > 0) {
        const { s, idx } = partialStudents[0];
        const missing = [];
        if (s.name.trim().length === 0) missing.push("Name");
        if (s.className.trim().length === 0) missing.push("Class");
        if (s.section.trim().length === 0) missing.push("Section");
        if (s.admissionNumber.trim().length === 0) missing.push("Admission No");

        showFormError(
          `Team ${i + 1}, Participant ${idx + 1} is missing: ${missing.join(", ")}.`,
        );
        setLoading(false);
        return;
      }

      if (validStudents.length === 0 && partialStudents.length === 0) {
        continue;
      }

      if (validStudents.length < minSize) {
        showFormError(
          `Team ${i + 1} must have at least ${minSize} fully registered participant(s).`,
        );
        setLoading(false);
        return;
      }

      // Strict validation for valid students
      const invalidStudents = validStudents.filter((s) => {
        if (!nameRegex.test(s.name.trim())) return true;
        if (!isTeacherEvent) {
          if (!sectionRegex.test(s.section.trim())) return true;
          if (!admissionRegex.test(s.admissionNumber.trim())) return true;
        }
        return false;
      });

      if (invalidStudents.length > 0) {
        showFormError(
          `Team ${i + 1} contains invalid characters. Names must contain at least one letter and no numbers. Sections must be 1-5 letters/numbers. IDs can only contain letters, numbers, hyphens, and slashes.`,
        );
        setLoading(false);
        return;
      }
    }

    // Check for duplicate participants across all teams
    const allAdmissions = new Set<string>();
    for (let i = 0; i < teams.length; i++) {
      const validStudents = teams[i].filter((s) =>
        isTeacherEvent
          ? s.name.trim().length > 0
          : s.name.trim().length > 0 &&
            s.className.trim().length > 0 &&
            s.section.trim().length > 0 &&
            s.admissionNumber.trim().length > 0,
      );

      for (const student of validStudents) {
        const identifier = isTeacherEvent
          ? student.name.trim().toLowerCase()
          : student.admissionNumber.trim().toLowerCase();
        if (allAdmissions.has(identifier)) {
          setError({
            title: "Duplicate participant",
            message: `Team ${i + 1} repeats ${isTeacherEvent ? student.name : student.admissionNumber}. A participant can only be registered once per event.`,
            code: "DUPLICATE_PARTICIPANT",
            fixSteps: [
              "Remove the repeated participant from one of the teams.",
              "If two participants have the same admission number, correct one admission number before saving.",
            ],
          });
          setLoading(false);
          return;
        }
        allAdmissions.add(identifier);
      }
    }

    const result = await saveEventEnrollments(eventSlug, teams, isTeacherEvent, adminSchoolId);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {teams.map((team, teamIndex) => (
        <div
          key={teamIndex}
          className="p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-2xl relative"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-onyx">
              Team {teamIndex + 1}
            </h3>
            {teams.length > 1 && (
              <button
                type="button"
                onClick={() => removeTeam(teamIndex)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <Trash2 size={16} /> Delete Team
              </button>
            )}
          </div>

          <div className="hidden md:grid grid-cols-12 gap-4 mb-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-3 text-center">
            <div className="col-span-1">#</div>
            <div
              className={`text-left ${isTeacherEvent ? "col-span-10" : "col-span-4"}`}
            >
              {isTeacherEvent ? "Teacher Name" : "Student Name"}
            </div>
            {!isTeacherEvent && (
              <div className="col-span-2 text-left">Class</div>
            )}
            {!isTeacherEvent && (
              <div className="col-span-2 text-left">Section</div>
            )}
            {!isTeacherEvent && (
              <div className="col-span-2 text-left">Admission No.</div>
            )}
            <div className="col-span-1">Status</div>
          </div>

          <div className="space-y-5 md:space-y-0 md:flex md:flex-col">
            {team.map((student, index) => {
              const isRequired = index < minSize;

              return (
                <div
                  key={index}
                  className="flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center py-5 md:py-3.5 border-b border-gray-100 last:border-b-0 px-2 group hover:bg-gray-50/50 rounded-lg transition-colors -mx-2"
                >
                  {/* Mobile Header & Desktop Participant # */}
                  <div className="col-span-1 flex items-center justify-between md:justify-center gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isRequired ? "bg-onyx text-white shadow-sm" : "bg-gray-100 text-gray-500"}`}
                      >
                        {index + 1}
                      </div>
                      <span className="md:hidden font-bold text-onyx">
                        Participant {index + 1}
                      </span>
                    </div>
                    {/* Badge for MOBILE only */}
                    <div className="md:hidden">
                      {isRequired ? (
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100 shrink-0">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-gray-200 shrink-0">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div
                    className={`flex flex-col gap-1.5 ${isTeacherEvent ? "col-span-10" : "col-span-4"}`}
                  >
                    <label className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                      {isTeacherEvent ? "Teacher Name" : "Student Name"}
                    </label>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) =>
                        handleFieldChange(
                          teamIndex,
                          index,
                          "name",
                          e.target.value,
                        )
                      }
                      placeholder={
                        isTeacherEvent ? "e.g. Mrs. Smith" : "e.g. John Doe"
                      }
                      pattern="[A-Za-z\s\-']*[A-Za-z][A-Za-z\s\-']*"
                      title="Must contain at least one letter. Only letters, spaces, hyphens, and apostrophes are allowed. No numbers."
                      maxLength={100}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400 shadow-sm"
                    />
                  </div>

                  {!isTeacherEvent && (
                    <>
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                          Class
                        </label>
                        <select
                          value={student.className || allowedClasses[0]}
                          onChange={(e) =>
                            handleFieldChange(
                              teamIndex,
                              index,
                              "className",
                              e.target.value,
                            )
                          }
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-onyx shadow-sm"
                        >
                          {allowedClasses.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                          Section
                        </label>
                        <input
                          type="text"
                          value={student.section}
                          onChange={(e) =>
                            handleFieldChange(
                              teamIndex,
                              index,
                              "section",
                              e.target.value.toUpperCase(),
                            )
                          }
                          placeholder="e.g. A"
                          pattern="[A-Za-z0-9]{1,5}"
                          title="1 to 5 letters or numbers only."
                          maxLength={5}
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400 shadow-sm uppercase"
                        />
                      </div>

                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                          Admission No.
                        </label>
                        <input
                          type="text"
                          value={student.admissionNumber}
                          onChange={(e) =>
                            handleFieldChange(
                              teamIndex,
                              index,
                              "admissionNumber",
                              e.target.value,
                            )
                          }
                          placeholder="ID Card No."
                          pattern="[A-Za-z0-9\-\/]+"
                          title="Only letters, numbers, hyphens, and slashes are allowed."
                          maxLength={20}
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400 shadow-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* Desktop Badge */}
                  <div className="hidden md:flex col-span-1 justify-center">
                    {isRequired ? (
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100 shrink-0">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-gray-200 shrink-0">
                        Optional
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {teams.length < maxTeams && (
        <button
          type="button"
          onClick={addTeam}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-taupe font-semibold hover:border-onyx hover:text-onyx hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add Another Team
        </button>
      )}

      <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-2">
              <div>
                <p className="text-sm font-bold text-red-800">{error.title}</p>
                <p className="text-sm font-medium">{error.message}</p>
              </div>
              {error.fixSteps && error.fixSteps.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-red-800">
                    How to fix
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">
                    {error.fixSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              {error.code && (
                <p className="text-xs font-medium text-red-800">
                  Error code: {error.code}
                </p>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Successfully saved participants and their details!
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-center sm:text-left">
            <p className="text-red-600 font-bold mb-1 flex items-center gap-1.5 justify-center sm:justify-start">
              <AlertCircle size={14} />
              Please make sure to click "Save Participants" below to confirm
              your registration.
            </p>
            <p className="text-taupe">
              You can return and edit these details at any time until the
              registration deadline.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-onyx text-white px-8 py-3 rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Save Participants"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
