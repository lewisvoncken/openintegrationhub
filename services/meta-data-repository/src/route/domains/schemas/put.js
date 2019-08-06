const express = require('express');
const logger = require('@basaas/node-logger');
const { domainOwnerOrAllowed } = require('../../../middleware/permission');

const conf = require('../../../conf');
const { SchemaDAO } = require('../../../dao');
const {
    transformSchema, validateSchema, URIfromId, transformDbResults, buildURI,
} = require('../../../transform');

const log = logger.getLogger(`${conf.logging.namespace}/domains/schemas:put`);

const router = express.Router();

router.put('/:uri*', domainOwnerOrAllowed({
    permissions: ['not.defined'],
}), async (req, res, next) => {
    const { data } = req.body;
    try {
        if (!data) throw 'Missing data';

        const { name, description, value } = data;

        validateSchema({
            schema: value,
        });

        const transformed = await transformSchema({
            domain: req.domainId,
            schema: value,
        });

        res.send({
            data: transformDbResults(await SchemaDAO.updateByURI({

                name: name || transformed.schema.title,
                domainId: req.domainId,
                description,
                uri: buildURI({
                    domainId: req.domainId,
                    uri: req.path.replace(/^\//, ''),
                }),
                newUri: URIfromId(transformed.schema.$id),
                value: JSON.stringify(transformed.schema),
                refs: transformed.backReferences,
            })),
        });
    } catch (err) {
        log.error(err);
        next({
            status: 500,
        });
    }
});

module.exports = router;