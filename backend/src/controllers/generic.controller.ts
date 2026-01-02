import { Request, Response } from 'express';
import { Model, ModelStatic } from 'sequelize';

export class GenericController<T extends Model> {
    constructor(private model: ModelStatic<T>) { }

    getAll = async (req: Request, res: Response) => {
        try {
            const items = await this.model.findAll();
            res.json(items);
        } catch (error: any) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    };

    getOne = async (req: Request, res: Response) => {
        try {
            const item = await this.model.findByPk(req.params.id);
            if (item) res.json(item);
            else res.status(404).json({ error: 'Not Found' });
        } catch (error: any) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    };

    create = async (req: Request, res: Response) => {
        try {
            const item = await this.model.create(req.body);
            res.status(201).json(item);
        } catch (error: any) {
            res.status(400).json({ error: 'Bad Request', details: error.message });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const [updated] = await this.model.update(req.body, { where: { id: req.params.id } as any });
            if (updated) {
                const item = await this.model.findByPk(req.params.id);
                res.json(item);
            } else {
                res.status(404).json({ error: 'Not Found' });
            }
        } catch (error: any) {
            res.status(400).json({ error: 'Bad Request', details: error.message });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const deleted = await this.model.destroy({ where: { id: req.params.id } as any });
            if (deleted) res.status(204).send();
            else res.status(404).json({ error: 'Not Found' });
        } catch (error: any) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    };
}
