import { Module } from "../models/Module.js";

export const createModule = async (req, res) => {
  try {
    const { moduleTitle, description, files, courseId } = req.body;
    const newModule = await Module.create({
      moduleTitle,
      description,
      files,
      courseId,
      createdBy: req.user._id,
    });
    res.status(201).json(newModule);
  } catch (err) {
    res.status(500).json({ message: "Error creating module", error: err.message });
  }
};

export const getModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.find({ courseId: req.params.courseId });
    res.json(modules);
  } catch (err) {
    res.status(500).json({ message: "Error fetching modules", error: err.message });
  }
};

export const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: "Module not found" });
    res.json(module);
  } catch (err) {
    res.status(500).json({ message: "Error fetching module", error: err.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const deleted = await Module.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Module not found" });
    res.json({ message: "Module deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting module", error: err.message });
  }
};
