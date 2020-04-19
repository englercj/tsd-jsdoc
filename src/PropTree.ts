import { Dictionary } from './Dictionary';
import { warn } from './logger';

export interface IPropDesc
{
    prop: IDocletProp;
    name: string;
    children: IPropDesc[];
}

export class PropTree
{
    roots: IPropDesc[] = [];
    nodes: Dictionary<IPropDesc> = {};

    constructor(props: IDocletProp[])
    {
        // create all node for each property
        for (let i = 0; i < props.length; ++i)
        {
            const prop = props[i];

            if (!prop || !prop.name)
            {
                warn('Encountered a property with no name, this is likely due to invalid JSDoc. Skipping.');
                continue;
            }

            const parts = prop.name.split('.');

            this.nodes[prop.name] = {
                prop,
                name: parts[parts.length - 1],
                children: [],
            };
        }

        // build the tree of props
        for (let i = 0; i < props.length; ++i)
        {
            const prop = props[i];

            if (!prop || !prop.name)
                continue;

            const parts = prop.name.split('.');

            const obj = this.nodes[prop.name];

            if (!obj)
            {
                warn('Failed to find dot-notation property in map. This is likely a bug.');
                continue;
            }

            if (parts.length > 1)
            {
                parts.pop();
                let parentName = parts.join('.');
                if (parentName.endsWith('[]'))
                {
                    parentName = parentName.substring(0, parentName.length - '[]'.length);
                }

                const parent = this.nodes[parentName];

                if (!parent)
                {
                    // TODO LOG WARNING
                    continue;
                }

                parent.children.push(obj);
            }
            else
            {
                this.roots.push(obj)
            }
        }
    }
}
