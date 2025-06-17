import { Module } from "../models/Module.js";

export const createModule = async (req, res) => {
    try {
      const { moduleTitle, description, files, courseId, createdBy } = req.body; // ✅ added createdBy
  
      const newModule = await Module.create({
        moduleTitle,
        description,
        files,
        courseId,
        createdBy,
      });
  
      res.status(201).json(newModule);
    } catch (err) {
      res.status(500).json({ message: "Error creating module", error: err.message });
    }
  };
  
// GET all modules by course ID
export const getModulesByCourse = async (req, res) => {
    try {
      const modules = await Module.find({ courseId: req.params.courseId }).sort({ createdAt: 1 });
      res.json({ status: true, modules });
    } catch (err) {
      res.status(500).json({ status: false, message: "Error fetching modules", error: err.message });
    }
  };


// GET single module by ID
export const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ status: false, message: "Module not found" });
    }
    res.json({ status: true, module });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error fetching module", error: err.message });
  }
};


// UPDATE module by ID
export const updateModule = async (req, res) => {
    try {
      const module = await Module.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
  
      if (!module) {
        return res.status(404).json({ status: false, message: "Module not found" });
      }
  
      res.json({ status: true, message: "Module updated", module });
    } catch (err) {
      res.status(400).json({ status: false, message: "Error updating module", error: err.message });
    }
  };

  
// DELETE module by ID
export const deleteModule = async (req, res) => {
    try {
      const deleted = await Module.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ status: false, message: "Module not found" });
      }
      res.json({ status: true, message: "Module deleted" });
    } catch (err) {
      res.status(500).json({ status: false, message: "Error deleting module", error: err.message });
    }
  };