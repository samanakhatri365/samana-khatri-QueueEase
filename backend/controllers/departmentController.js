import Department from "../models/Department.js";

// Get all active departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.json({ departments });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new department (admin only)
export const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    const existing = await Department.findOne({ 
      $or: [{ name }, { code: code.toUpperCase() }] 
    });
    
    if (existing) {
      return res.status(409).json({ message: "Department already exists" });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description
    });

    res.status(201).json({ department });
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset department queue (admin only)
export const resetDepartmentQueue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findByIdAndUpdate(
      id,
      { currentToken: 0, nowServing: 0 },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ department, message: "Queue reset successfully" });
  } catch (error) {
    console.error("Reset queue error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Seed initial departments
export const seedDepartments = async (req, res) => {
  try {
    const defaultDepts = [
      { name: "General OPD", code: "OPD", description: "General Outpatient Department" },
      { name: "Dental", code: "DNT", description: "Dental Care Unit" },
      { name: "Eye Care", code: "EYE", description: "Ophthalmology Department" },
      { name: "Cardiology", code: "CRD", description: "Heart & Cardiovascular" },
      { name: "Orthopedics", code: "ORT", description: "Bone & Joint Care" },
      { name: "Pediatrics", code: "PED", description: "Child Healthcare" }
    ];

    for (const dept of defaultDepts) {
      await Department.findOneAndUpdate(
        { code: dept.code },
        dept,
        { upsert: true, new: true }
      );
    }

    const departments = await Department.find({ isActive: true });
    res.json({ message: "Departments seeded", departments });
  } catch (error) {
    console.error("Seed departments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
