import express from "express";

const setupStatic = (app, staticpath) => {

    app.use(express.static(staticpath))
}

export default setupStatic