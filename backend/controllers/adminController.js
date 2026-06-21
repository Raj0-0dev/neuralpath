import Role from "../models/Role.js";
import User from "../models/User.js";
import GapAnalysis from "../models/GapAnalysis.js";
import EmployeeSkill from "../models/EmployeeSkill.js";
import ProgressTracking from "../models/ProgressTracking.js";
import SkillVideo from "../models/SkillVideo.js";
import Resume from "../models/Resume.js";

// GET /api/admin/employees
export const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");

    const employeeData = await Promise.all(
      employees.map(async (emp) => {
        const gap = await GapAnalysis.findOne({ employeeId: emp._id });

        // strengths are the matching skills
        const strengths = gap ? gap.matchingSkills : [];

        // gaps are the missing skills
        const gaps = gap
          ? gap.skillsWithScores
            .filter(s => s.score === 0)
            .map(s => ({
              skill: s.name,
              priority: "high",
              current: 0,
              required: 75
            }))
          : [];

        return {
          id: emp._id.toString(),
          name: emp.name,
          email: emp.email,
          targetRole: emp.targetRole || "Not Specified",
          company: emp.company || "Not Specified",
          readiness: gap ? gap.matchPercentage : 0,
          strengths,
          gaps
        };
      })
    );

    res.status(200).json({
      success: true,
      data: employeeData
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/employees/:uid
export const getEmployeeById = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const emp = await User.findById(uid).select("-password");
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const gap = await GapAnalysis.findOne({ employeeId: emp._id });

    // strengths are the matching skills
    const strengths = gap ? gap.matchingSkills : [];

    // gaps are the missing skills
    const gaps = gap
      ? gap.skillsWithScores
        .filter(s => s.score === 0)
        .map(s => ({
          skill: s.name,
          priority: "high",
          current: 0,
          required: 75
        }))
      : [];

    // Generate timeline dynamically
    const activityLog = [];

    // 1. Created account activity
    activityLog.push({
      title: "Account Registered",
      type: "System",
      date: emp.createdAt ? emp.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      score: 100
    });

    // 2. Uploaded resume activity (if they have a resume)
    const resume = await Resume.findOne({ employeeId: emp._id });
    if (resume) {
      activityLog.push({
        title: "Resume Analyzed & Skill Profile Extracted",
        type: "File",
        date: resume.uploadedAt ? resume.uploadedAt.toISOString().split("T")[0] : resume.createdAt.toISOString().split("T")[0],
        score: 100
      });
    }

    // 3. Completed skills in ProgressTracking
    const progress = await ProgressTracking.findOne({ employeeId: emp._id });
    if (progress) {
      if (progress.completedModules && progress.completedModules.length > 0) {
        progress.completedModules.forEach(modId => {
          const parts = modId.split("_");
          const label = parts.length > 2
            ? parts.slice(2).join(" ").toUpperCase()
            : modId;

          activityLog.push({
            title: `${label} Module Completed`,
            type: "Course",
            date: progress.updatedAt ? progress.updatedAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            score: 100
          });
        });
      }
    }

    // Sort activity logs by date desc
    activityLog.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: {
        id: emp._id.toString(),
        name: emp.name,
        email: emp.email,
        targetRole: emp.targetRole || "Not Specified",
        company: emp.company || "Not Specified",
        readiness: gap ? gap.matchPercentage : 0,
        strengths,
        gaps,
        activityLog
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/analytics
export const getCohortAnalytics = async (req, res, next) => {
  try {
    const gapsList = await GapAnalysis.find({});
    const counts = {};

    gapsList.forEach((gap) => {
      if (Array.isArray(gap.missingSkills)) {
        gap.missingSkills.forEach((skill) => {
          counts[skill] = (counts[skill] || 0) + 1;
        });
      }
    });

    const deficiencies = Object.keys(counts).map(skill => ({
      skill,
      count: counts[skill]
    })).sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      data: {
        deficiencies
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/roles
export const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find({});
    // Format response to match the frontend shape (id: _id)
    const formattedRoles = roles.map(r => ({
      id: r._id.toString(),
      title: r.title,
      description: r.description,
      requiredSkills: r.requiredSkills
    }));
    res.status(200).json({
      success: true,
      data: formattedRoles
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/roles
export const createRole = async (req, res, next) => {
  try {
    const { title, description, requiredSkills } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role title is required"
      });
    }

    const trimmedTitle = title.trim();
    // check if role already exists
    let existingRole = await Role.findOne({ title: { $regex: new RegExp(`^${trimmedTitle}$`, "i") } });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "A competency profile with this role title already exists"
      });
    }

    const role = await Role.create({
      title: trimmedTitle,
      description: description || "",
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : []
    });

    res.status(201).json({
      success: true,
      data: {
        id: role._id.toString(),
        title: role.title,
        description: role.description,
        requiredSkills: role.requiredSkills
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/roles/:id
export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRole = await Role.findByIdAndDelete(id);
    if (!deletedRole) {
      return res.status(404).json({
        success: false,
        message: "Competency profile not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Competency profile deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/resources
export const getResources = async (req, res, next) => {
  try {
    const skillVideos = await SkillVideo.find({});
    const flatResources = [];
    skillVideos.forEach(sv => {
      sv.videos.forEach(v => {
        flatResources.push({
          id: `${sv.skillName}_${v.segment}`,
          skillName: sv.skillName,
          title: v.title,
          url: v.videoUrl,
          type: "video",
          segment: v.segment
        });
      });
    });
    res.status(200).json({
      success: true,
      data: flatResources
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/resources
export const addResource = async (req, res, next) => {
  try {
    const { skillName, title, url, videoUrl } = req.body;
    if (!skillName || !skillName.trim() || !title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "skillName and title are required"
      });
    }

    const trimmedSkill = skillName.trim();
    const finalUrl = url || videoUrl || "#";

    let skillVideo = await SkillVideo.findOne({ skillName: { $regex: new RegExp(`^${trimmedSkill}$`, "i") } });
    if (!skillVideo) {
      // Find exact case or create new
      skillVideo = new SkillVideo({ skillName: trimmedSkill, videos: [] });
    }

    const nextSegment = skillVideo.videos.length > 0
      ? Math.max(...skillVideo.videos.map(v => v.segment)) + 1
      : 1;

    const newVideo = {
      segment: nextSegment,
      title: title.trim(),
      videoUrl: finalUrl
    };

    skillVideo.videos.push(newVideo);
    await skillVideo.save();

    res.status(201).json({
      success: true,
      data: {
        id: `${skillVideo.skillName}_${newVideo.segment}`,
        skillName: skillVideo.skillName,
        title: newVideo.title,
        url: newVideo.videoUrl,
        type: "video",
        segment: newVideo.segment
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/resources/:id
export const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    let skillName, segment;

    // Support either :id as skillName_segment or split path parameters
    if (id.includes("_")) {
      const parts = id.split("_");
      segment = parseInt(parts.pop(), 10);
      skillName = parts.join("_");
    } else {
      skillName = req.query.skillName || req.body.skillName;
      segment = parseInt(req.query.segment || req.body.segment, 10);
    }

    if (!skillName || isNaN(segment)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource identifier format. Must be 'skillName_segment'"
      });
    }

    const skillVideo = await SkillVideo.findOne({ skillName: { $regex: new RegExp(`^${skillName}$`, "i") } });
    if (!skillVideo) {
      return res.status(404).json({
        success: false,
        message: "Skill category not found"
      });
    }

    const originalLength = skillVideo.videos.length;
    skillVideo.videos = skillVideo.videos.filter(v => v.segment !== segment);

    if (skillVideo.videos.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Resource segment not found"
      });
    }

    if (skillVideo.videos.length === 0) {
      await SkillVideo.findByIdAndDelete(skillVideo._id);
    } else {
      await skillVideo.save();
    }

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
